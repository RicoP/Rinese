var CPU = function() {
    function CPU() {
        this._regA = new Uint8Array(1);
        this._regX = new Uint8Array(1);
        this._regY = new Uint8Array(1);
        this._regP = new Uint8Array(1);
        this._regS = new Uint8Array(1);
        this._regPC = new Uint16Array(1);
        this._regPCH = new Uint8Array(this._regPC.buffer, 1, 1);
        this._regPCL = new Uint8Array(this._regPC.buffer, 0, 1);
        this.RAM = new Uint8Array(65535);
        this.timer = 0;
    }
    CPU.prototype.OPCODE_ADC = function(value) {
        var tmp = this._regA[0] + value + ((this._regP[0] & 1) !== 0 ? 1 : 0);
        if ((this._regA[0] & 128) !== (tmp & 128)) {
            this._regP[0] = this._regP[0] | 64;
        } else {
            this._regP[0] = this._regP[0] & ~64;
        }
        if (tmp > 255) {
            this._regP[0] = this._regP[0] | 1;
        } else {
            this._regP[0] = this._regP[0] & ~1;
        }
        this._regA[0] = tmp;
        if (this._regA[0] === 0) {
            this._regP[0] = this._regP[0] | 2;
        } else {
            this._regP[0] = this._regP[0] & ~2;
        }
        if (this._regA[0] > 127) {
            this._regP[0] = this._regP[0] | 128;
        } else {
            this._regP[0] = this._regP[0] & ~128;
        }
    };
    CPU.prototype.step = function() {
        var opcode = this.RAM[this._regPC[0]++];
        switch (opcode) {
          case 105:
            {
                this.OPCODE_ADC(this.RAM[this._regPC[0]++]);
                break;
            }

          case 101:
            {
                this.OPCODE_ADC(this.RAM[this.RAM[this._regPC[0]++]]);
                break;
            }

          case 117:
            {
                this.OPCODE_ADC(this.RAM[this.RAM[this._regPC[0]++] + this._regX[0] & 255]);
                break;
            }
        }
    };
    return CPU;
}();