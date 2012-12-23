#define A _regA[0]
#define X _regX[0]
#define Y _regY[0]
#define P _regP[0]
#define S _regS[0]

#define PC _regPC[0]
#define PCL _regPCL[0]
#define PCH _regPCH[0]

#define FLAG_C 0x01
#define FLAG_Z 0x02
#define FLAG_I 0x04
#define FLAG_D 0x08
#define FLAG_B 0x10
#define FLAG_E 0x20
#define FLAG_V 0x40
#define FLAG_N 0x80



//Addressing modes
/*#define MODE_A         MA
#define MODE_X         MX
#define MODE_Y         MY
#define MODE_ABSOLUTE  ABSOLUTE
#define MODE_IMMEDIATE IMMEDIATE
#define MODE_INDIRECT  INDIRECT 
#define MODE_ZERO_PAGE ZERO_PAGE*/

#define READ_MA() \
    this.A

#define READ_MX() \
    this.X

#define READ_MY() \
    this.Y

#define READ_BYTE() \
    (this.RAM[this.PC++])

#define READ_ABSOLUTE() \
    (READ_BYTE() | READ_BYTE() << 8)

#define READ_ZERO_PAGE() \
    (READ_BYTE() | this.PCH << 8)

#define READ_IMMEDIATE() \
    READ_BYTE()

#define READ_INDIRECT() \
    0 /* dunno what to do! */

#define READ_VALUE(MODE) \
    READ_##MODE()

#define DEST_MA this.A
#define DEST_MX this.X
#define DEST_MY this.Y

#define DESTINATION(MODE) \
    DEST_##MODE

#define GET_FLAG(F) \
    ((this.P & FLAG_##F) !== 0 ? 1 : 0)

#define SET_FLAG(F) \
    this.P = this.P | FLAG_##F;

#define UNSET_FLAG(F) \
    this.P = this.P & (~FLAG_##F);    

#define SET_FLAG_ON(F,cond) \
  if((cond)) { SET_FLAG(F) } else { UNSET_FLAG(F) }


#define OP_IR___(NAME,MODE,TIME,CODE)         \
                                              \
  case CODE:                                  \
  {                                           \
    this.OPCODE_##NAME( READ_##MODE() );      \
  }

 

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

  public step() {
    var opcode = READ_BYTE(); 
    switch(opcode) {
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

      // param 1 = instruction
      // param 2 = addressing mode
      // param 3 = cycles
      // param 4 = opcode
      
		  OP_IR___( ADC, IMMEDIATE, 2, 0x69 )
      //OPCODE(ADC, 0x69, MODE_IMMEDIATE, MODE_A, 2); 
      //OPCODE(ADC, 0x65, MODE_ZERO_PAGE, MODE_A, 3); 
      //OPCODE(ADC, 0x75, MODE_ZERO_PAGE, MODE_X, 4); 
      //OPCODE(ADC, 0x6D, MODE_ABSOLUTE,  MODE_A, 4);
      //OPCODE(ADC, 0x7D, MODE_ABSOLUTE,  MODE_X, 4); 
      //OPCODE(ADC, 0x79, MODE_ABSOLUTE,  MODE_Y, 4); 
      //OPCODE(ADC, 0x61, MODE_INDIRECT,  MODE_X, 6); 
      //OPCODE(ADC, 0x71, MODE_INDIRECT,  MODE_Y, 5); 

    }
  }
}
