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
    CPU.prototype.OPCODE_AND = function(value) {
        this._regA[0] &= value;
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
    CPU.prototype.OPCODE_ASL = function(value) {
        var ret = value << 1;
        if (ret > 127) {
            this._regP[0] = this._regP[0] | 128;
        } else {
            this._regP[0] = this._regP[0] & ~128;
        }
        if (ret === 0) {
            this._regP[0] = this._regP[0] | 2;
        } else {
            this._regP[0] = this._regP[0] & ~2;
        }
        if (ret > 255) {
            this._regP[0] = this._regP[0] | 1;
        } else {
            this._regP[0] = this._regP[0] & ~1;
        }
        return ret & 255;
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

          case 109:
            {
                this.OPCODE_ADC(this.RAM[this.RAM[this._regPC[0]++] | this.RAM[this._regPC[0]++] << 8]);
                break;
            }

          case 125:
            {
                this.OPCODE_ADC(this.RAM[(this.RAM[this._regPC[0]++] | this.RAM[this._regPC[0]++] << 8) + this._regX[0]]);
                break;
            }

          case 121:
            {
                this.OPCODE_ADC(this.RAM[(this.RAM[this._regPC[0]++] | this.RAM[this._regPC[0]++] << 8) + this._regY[0]]);
                break;
            }

          case 97:
            {
                this.OPCODE_ADC(this.RAM[this.RAM[this.RAM[this._regPC[0]++] + this._regX[0] & 255]]);
                break;
            }

          case 113:
            {
                this.OPCODE_ADC(this.RAM[this.RAM[this.RAM[this._regPC[0]++] + this._regY[0] & 255]]);
                break;
            }

          case 41:
            {
                this.OPCODE_AND(this.RAM[this._regPC[0]++]);
                break;
            }

          case 37:
            {
                this.OPCODE_AND(this.RAM[this.RAM[this._regPC[0]++]]);
                break;
            }

          case 53:
            {
                this.OPCODE_AND(this.RAM[this.RAM[this._regPC[0]++] + this._regX[0] & 255]);
                break;
            }

          case 45:
            {
                this.OPCODE_AND(this.RAM[this.RAM[this._regPC[0]++] | this.RAM[this._regPC[0]++] << 8]);
                break;
            }

          case 61:
            {
                this.OPCODE_AND(this.RAM[(this.RAM[this._regPC[0]++] | this.RAM[this._regPC[0]++] << 8) + this._regX[0]]);
                break;
            }

          case 57:
            {
                this.OPCODE_AND(this.RAM[(this.RAM[this._regPC[0]++] | this.RAM[this._regPC[0]++] << 8) + this._regY[0]]);
                break;
            }

          case 33:
            {
                this.OPCODE_AND(this.RAM[this.RAM[this.RAM[this._regPC[0]++] + this._regX[0] & 255]]);
                break;
            }

          case 49:
            {
                this.OPCODE_AND(this.RAM[this.RAM[this.RAM[this._regPC[0]++] + this._regY[0] & 255]]);
                break;
            }

          case 10:
            {
                this._regA[0] = this.OPCODE_ASL(this._regA[0]);
                break;
            }

          case 6:
            {
                var address;
                var data = this.RAM[address = this.RAM[this._regPC[0]++]];
                this.RAM[address] = this.OPCODE_ASL(data);
                break;
            }
        }
    };
    return CPU;
}();