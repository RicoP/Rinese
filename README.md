Rinese
======




echo " var c = new CPU(); c.RAM[0]=105;c.RAM[1]=1; c._regA[0]=128; c.step(); console.log(c._regA[0], c._regP[0]); " | cat rinese.js - | node

