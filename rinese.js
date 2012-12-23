var CPU = function() {
    function CPU() {
        this._regs = new ArrayBuffer(8);
        this._reg8 = new Uint8Array(this._regs);
        this._reg16 = new Uint16Array(this._regs);
        this.RAM = new Uint8Array(65535);
        this.timer = 0;
    }
    CPU.prototype.step = function() {
        var opcode = this.RAM[this._reg16[3]++];
        switch (opcode) {
          case 105:
            {
                {
                    var val = this.RAM[this._reg16[3]++];
                    if (val + this._reg8[0] > 255) {
                        this._reg8[4] = this._reg8[4] | 1;
                    } else {
                        this._reg8[4] = this._reg8[4] & ~1;
                    }
                    this._reg8[0] += val;
                    this.timer -= 2;
                    break;
                }
            }

          case 101:
            {
                {
                    var val = this.RAM[this._reg16[3]++] | this._reg8[7] << 8;
                    if (val + this._reg8[0] > 255) {
                        this._reg8[4] = this._reg8[4] | 1;
                    } else {
                        this._reg8[4] = this._reg8[4] & ~1;
                    }
                    this._reg8[0] += val;
                    this.timer -= 3;
                    break;
                }
            }

          case 117:
            {
                {
                    var val = this.RAM[this._reg16[3]++] | this._reg8[7] << 8;
                    if (val + this._reg8[1] > 255) {
                        this._reg8[4] = this._reg8[4] | 1;
                    } else {
                        this._reg8[4] = this._reg8[4] & ~1;
                    }
                    this._reg8[1] += val;
                    this.timer -= 4;
                    break;
                }
            }

          case 109:
            {
                {
                    var val = this.RAM[this._reg16[3]++] | this.RAM[this._reg16[3]++] << 8;
                    if (val + this._reg8[0] > 255) {
                        this._reg8[4] = this._reg8[4] | 1;
                    } else {
                        this._reg8[4] = this._reg8[4] & ~1;
                    }
                    this._reg8[0] += val;
                    this.timer -= 4;
                    break;
                }
            }

          case 125:
            {
                {
                    var val = this.RAM[this._reg16[3]++] | this.RAM[this._reg16[3]++] << 8;
                    if (val + this._reg8[1] > 255) {
                        this._reg8[4] = this._reg8[4] | 1;
                    } else {
                        this._reg8[4] = this._reg8[4] & ~1;
                    }
                    this._reg8[1] += val;
                    this.timer -= 4;
                    break;
                }
            }

          case 121:
            {
                {
                    var val = this.RAM[this._reg16[3]++] | this.RAM[this._reg16[3]++] << 8;
                    if (val + this._reg8[2] > 255) {
                        this._reg8[4] = this._reg8[4] | 1;
                    } else {
                        this._reg8[4] = this._reg8[4] & ~1;
                    }
                    this._reg8[2] += val;
                    this.timer -= 4;
                    break;
                }
            }

          case 97:
            {
                {
                    var val = 0;
                    if (val + this._reg8[1] > 255) {
                        this._reg8[4] = this._reg8[4] | 1;
                    } else {
                        this._reg8[4] = this._reg8[4] & ~1;
                    }
                    this._reg8[1] += val;
                    this.timer -= 6;
                    break;
                }
            }

          case 113:
            {
                {
                    var val = 0;
                    if (val + this._reg8[2] > 255) {
                        this._reg8[4] = this._reg8[4] | 1;
                    } else {
                        this._reg8[4] = this._reg8[4] & ~1;
                    }
                    this._reg8[2] += val;
                    this.timer -= 5;
                    break;
                }
            }
        }
    };
    return CPU;
}();