#define A _reg8[0]
#define X _reg8[1]
#define Y _reg8[2]
#define P _reg8[4]
#define S _reg8[5]

#define PC _reg16[3]
#define PCL _reg8[6]
#define PCH _reg8[7]

#define FLAG_C 0x01
#define FLAG_Z 0x02
#define FLAG_I 0x04
#define FLAG_D 0x08
#define FLAG_B 0x10
#define FLAG_E 0x20
#define FLAG_V 0x40
#define FLAG_N 0x80



//Addressing modes
#define MODE_A         MA
#define MODE_X         MX
#define MODE_Y         MY
#define MODE_ABSOLUTE  ABSOLUTE
#define MODE_IMMEDIATE IMMEDIATE
#define MODE_INDIRECT  INDIRECT 
#define MODE_ZERO_PAGE ZERO_PAGE

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

#define SET_FLAG(F) \
    this.P = this.P | FLAG_##F;

#define UNSET_FLAG(F) \
    this.P = this.P & (~FLAG_##F);    

#define OPCODE_ADC(MODE_READ, MODE_WRITE)      \
    var val = READ_VALUE(MODE_READ);           \
    /* TODO: Put Page overflow into account */ \
    if(val + DESTINATION(MODE_WRITE) > 255) {  \
      SET_FLAG(C);                             \
    }                                          \
    else {                                     \
      UNSET_FLAG(C);                           \
    }                                          \
    DESTINATION(MODE_WRITE) += val;


#define OPCODE(NAME, CODE, MODE_READ, MODE_WRITE, TIME) \
  case CODE: {                                          \
    OPCODE_##NAME(MODE_READ, MODE_WRITE);               \
    this.timer -= TIME;                                 \
    break;                                              \
  }
   

class CPU {
  //Regsiter 
  private _regs : ArrayBuffer; 
  private _reg8 : Uint8Array;
  private _reg16 : Uint16Array;
  private RAM : ArrayBuffer; 
  private timer : number; //calc down till zero till next interrupt

  constructor() {
    this._regs  = new ArrayBuffer(8)
    this._reg8  = new Uint8Array(this._regs); //10
    this._reg16 = new Uint16Array(this._regs); //5
    this.RAM    = new Uint8Array(0xFFFF); 
    this.timer  = 0;
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
      //OP_
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
