#define A _regA[0]
#define X _regX[0]
#define Y _regY[0]
#define P _regP[0]
#define S _regS[0]

#define PC _regPC[0]
#define PCL _regPCL[0]
#define PCH _regPCH[0]

#define FLAG_C 0x01 //Carry 
#define FLAG_Z 0x02 //Zero 
#define FLAG_I 0x04 //Interop
#define FLAG_D 0x08 //Decimal (unused?) 
#define FLAG_B 0x10 //wat? 
#define FLAG_E 0x20 //Extra (unused) 
#define FLAG_V 0x40 //Sign Change 
#define FLAG_N 0x80 //Negative 

#define NONE

//RAM manipulation 
#define READ_RAM_BYTE(addr) \
    this.RAM[addr]

#define WRITE_RAM_BYTE(address, value) \
    this.RAM[address] = value

//Read data from Program counter
#define READ_BYTE() \
    (READ_RAM_BYTE(this.PC++))

#define READ_WORD() \
    (READ_BYTE() | (READ_BYTE() << 8))

//Read data from RAM 
#define READ_ABSOLUTE() \
    READ_RAM_BYTE(READ_WORD())

#define READ_ABSOLUTE_X() \
    READ_RAM_BYTE(READ_WORD() + this.X)

#define READ_ABSOLUTE_Y() \
    READ_RAM_BYTE(READ_WORD() + this.Y)

#define READ_ZERO_PAGE() \
    READ_RAM_BYTE(READ_BYTE())

#define READ_ZERO_PAGE_X() \
    READ_RAM_BYTE( (READ_BYTE()+this.X) & 0xFF )

#define READ_ZERO_PAGE_Y() \
    READ_RAM_BYTE( (READ_BYTE()+this.Y) & 0xFF )

#define READ_IMMEDIATE() \
    READ_BYTE()

#define READ_INDIRECT() \
    READ_RAM_BYTE(READ_WORD())

#define READ_INDIRECT_X() \
    READ_RAM_BYTE(READ_ZERO_PAGE_X())

#define READ_INDIRECT_Y() \
    READ_RAM_BYTE(READ_ZERO_PAGE_Y())

//Read data from RAM and store address for later use
#define READ_WRITE_ZERO_PAGE(address) \
    READ_RAM_BYTE(address = READ_BYTE())

#define WRITE_ZERO_PAGE(address, data) \
    WRITE_RAM_BYTE(address, data)

//Read flags
#define GET_FLAG(F) \
    ((this.P & FLAG_##F) !== 0 ? 1 : 0)

#define SET_FLAG(F) \
    this.P = this.P | FLAG_##F;

#define UNSET_FLAG(F) \
    this.P = this.P & (~FLAG_##F);

#define SET_FLAG_ON(F,cond) \
  if((cond)) { SET_FLAG(F) } else { UNSET_FLAG(F) }

//Opcode modes
#define OP_IR___(NAME,MODE,TIME,CODE)    \
  case CODE:                             \
    this.OPCODE_##NAME( READ_##MODE() ); \
    break;

#define OP_IRA__(NAME,NONE,TIME,CODE)      \
  case CODE:                               \
    this.A = this.OPCODE_##NAME( this.A ); \
    break;

#define OP_IRW__(NAME,MODE,TIME,CODE)              \
  case CODE:                                       \
    var address;                                  \
    var data  = READ_WRITE_##MODE(address); \
    WRITE_##MODE( address, this.OPCODE_##NAME(data) );   \
    break;

#define OP(OPTIONS, NAME, MODE, TIME, CODE) \
  OP_##OPTIONS(NAME, MODE, TIME, CODE)

class CPU {
  //Regsiter 
  private _regA : Uint8Array; //Accumulator
  private _regX : Uint8Array; //X
  private _regY : Uint8Array; //Y
  private _regP : Uint8Array; //Status 
  private _regS : Uint8Array; //Stack
  private _regPC : Uint16Array; //Program counter
  private _regPCH : Uint8Array; //PC High
  private _regPCL : Uint8Array; //PC Low

  private RAM : ArrayBuffer; 
  private timer : number; //calc down till zero to trigger next interrupt

  constructor() {
    this._regA   = new Uint8Array(1); 
    this._regX   = new Uint8Array(1); 
    this._regY   = new Uint8Array(1); 
    this._regP   = new Uint8Array(1); 
    this._regS   = new Uint8Array(1); 
    this._regPC  = new Uint16Array(1); 
    this._regPCH = new Uint8Array(this._regPC.buffer, 1,1);
    this._regPCL = new Uint8Array(this._regPC.buffer, 0,1);
    this.RAM     = new Uint8Array(0xFFFF); 
    this.timer   = 0;
  }

  private OPCODE_ADC( value ) {
    var tmp = this.A + value + GET_FLAG(C); 
    SET_FLAG_ON(V, (this.A & 0x80) !== (tmp & 0x80));
    SET_FLAG_ON(C, tmp > 255);

    this.A = tmp; //Overflow will be cut of automatically 
    SET_FLAG_ON(Z, this.A === 0);
    SET_FLAG_ON(N, this.A > 127);
  }

  private OPCODE_AND( value ) {
    this.A &= value;
    SET_FLAG_ON(Z, this.A === 0);
    SET_FLAG_ON(N, this.A > 127);
  }

  private OPCODE_ASL( value ) {
    var ret = value << 1;
    SET_FLAG_ON(N, ret > 127); 
    SET_FLAG_ON(Z, ret === 0); 
    SET_FLAG_ON(C, ret > 255); 

    return ret & 0xFF; //And not necessary? 
  }

  public step() {
    var opcode = READ_BYTE(); 
    switch(opcode) {
      // param 1 = Options    
      // param 2 = instruction
      // param 3 = addressing mode
      // param 4 = cycles
      // param 5 = opcode
      
      /*
      ADC (ADd with Carry)

      Affects Flags: S V Z C

      MODE           SYNTAX       HEX LEN TIM
      Immediate     ADC #$44      $69  2   2
      Zero Page     ADC $44       $65  2   3
      Zero Page,X   ADC $44,X     $75  2   4
      Absolute      ADC $4400     $6D  3   4
      Absolute,X    ADC $4400,X   $7D  3   4+
      Absolute,Y    ADC $4400,Y   $79  3   4+
      Indirect,X    ADC ($44,X)   $61  2   6
      Indirect,Y    ADC ($44),Y   $71  2   5+

      + add 1 cycle if page boundary crossed
      */  
      OP( IR___, ADC, IMMEDIATE,   2, 0x69 )
      OP( IR___, ADC, ZERO_PAGE,   3, 0x65 )
      OP( IR___, ADC, ZERO_PAGE_X, 4, 0x75 )
      OP( IR___, ADC, ABSOLUTE,    4, 0x6D )
      OP( IR___, ADC, ABSOLUTE_X,  4, 0x7D ) /* + */
      OP( IR___, ADC, ABSOLUTE_Y,  4, 0x79 ) /* + */
      OP( IR___, ADC, INDIRECT_X,  6, 0x61 ) 
      OP( IR___, ADC, INDIRECT_Y,  5, 0x71 ) /* + */

      /*
      AND (bitwise AND with accumulator)

      Affects Flags: S Z

      MODE           SYNTAX       HEX LEN TIM
      Immediate     AND #$44      $29  2   2
      Zero Page     AND $44       $25  2   3
      Zero Page,X   AND $44,X     $35  2   4
      Absolute      AND $4400     $2D  3   4
      Absolute,X    AND $4400,X   $3D  3   4+
      Absolute,Y    AND $4400,Y   $39  3   4+
      Indirect,X    AND ($44,X)   $21  2   6
      Indirect,Y    AND ($44),Y   $31  2   5+

      + add 1 cycle if page boundary crossed
      */
      OP( IR___, AND, IMMEDIATE,   2, 0x29 )
      OP( IR___, AND, ZERO_PAGE,   3, 0x25 )
      OP( IR___, AND, ZERO_PAGE_X, 4, 0x35 )
      OP( IR___, AND, ABSOLUTE,    4, 0x2D )
      OP( IR___, AND, ABSOLUTE_X,  4, 0x3D ) /* + */
      OP( IR___, AND, ABSOLUTE_Y,  4, 0x39 ) /* + */
      OP( IR___, AND, INDIRECT_X,  6, 0x21 ) 
      OP( IR___, AND, INDIRECT_Y,  5, 0x31 ) /* + */

      /*
      ASL (Arithmetic Shift Left)

      Affects Flags: S Z C

      MODE           SYNTAX       HEX LEN TIM
      Accumulator   ASL A         $0A  1   2
      Zero Page     ASL $44       $06  2   5
      Zero Page,X   ASL $44,X     $16  2   6
      Absolute      ASL $4400     $0E  3   6
      Absolute,X    ASL $4400,X   $1E  3   7
      */
      OP( IRA__, ASL, NONE,        2, 0x0A )
      OP( IRW__, ASL, ZERO_PAGE,   5, 0x06 )
    }
  }
}
