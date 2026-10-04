// Banco de preguntas generadas programaticamente
// Generadores aleatorios - nunca las mismas preguntas!
const QuestionBank = {
    overworld: {
        theme: QUESTION_THEMES.LINEAR,
        blocks: [
            {
                position: { x: 5, y: 1, z: -5 },
                type: 'tree',
                color: 0x2e7d32,
                questions: null
            },
            {
                position: { x: -5, y: 1, z: -8 },
                type: 'house',
                color: 0x8d6e63,
                questions: null
            },
            {
                position: { x: 8, y: 1, z: 3 },
                type: 'flower',
                color: 0xe91e63,
                questions: null
            },
            {
                position: { x: -8, y: 1, z: 5 },
                type: 'cow',
                color: 0xffffff,
                questions: null
            },
            {
                position: { x: 0, y: 1, z: -10 },
                type: 'crafting',
                color: 0x795548,
                questions: null
            }
        ]
    },
    mines: {
        theme: QUESTION_THEMES.QUADRATIC,
        blocks: [
            {
                position: { x: 3, y: -5, z: -6 },
                type: 'diamond',
                color: 0x00bcd4,
                questions: null
            },
            {
                position: { x: -4, y: -5, z: -3 },
                type: 'torch',
                color: 0xffc107,
                questions: null
            },
            {
                position: { x: 6, y: -5, z: 4 },
                type: 'pickaxe',
                color: 0x9e9e9e,
                questions: null
            },
            {
                position: { x: -6, y: -5, z: 6 },
                type: 'stone',
                color: 0x616161,
                questions: null
            },
            {
                position: { x: 0, y: -5, z: 8 },
                type: 'chest',
                color: 0x8d6e63,
                questions: null
            }
        ]
    },
    nether: {
        theme: QUESTION_THEMES.PROBABILITY,
        blocks: [
            {
                position: { x: 4, y: 1, z: -7 },
                type: 'enderpearl',
                color: 0x00e676,
                questions: null
            },
            {
                position: { x: -5, y: 1, z: -4 },
                type: 'blazerod',
                color: 0xff6f00,
                questions: null
            },
            {
                position: { x: 7, y: 1, z: 5 },
                type: 'netherchest',
                color: 0x5d4037,
                questions: null
            },
            {
                position: { x: -7, y: 1, z: 7 },
                type: 'netherrack',
                color: 0xb71c1c,
                questions: null
            },
            {
                position: { x: 0, y: 1, z: 10 },
                type: 'fortress',
                color: 0x3e2723,
                questions: null
            }
        ]
    },
    end: {
        theme: QUESTION_THEMES.MIXED,
        blocks: [
            {
                position: { x: 0, y: 1, z: -5 },
                type: 'obsidian',
                color: 0x1a1a2e,
                questions: null
            },
            {
                position: { x: 5, y: 1, z: 0 },
                type: 'endstone',
                color: 0xdbe3a4,
                questions: null
            },
            {
                position: { x: -5, y: 1, z: 0 },
                type: 'chorus',
                color: 0x9c27b0,
                questions: null
            },
            {
                position: { x: 0, y: 1, z: 5 },
                type: 'enderchest',
                color: 0x000000,
                questions: null
            },
            {
                position: { x: 0, y: 5, z: 0 },
                type: 'dragon',
                color: 0x4a148c,
                questions: null
            }
        ]
    }
};

window.QuestionBank=QuestionBank;
// === GENERADORES DE PREGUNTAS ===
// Crean 6 preguntas aleatorias por grado - infinita variedad!
const QuestionGenerators = {
    shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;},
    pick(arr){return arr[Math.floor(Math.random()*arr.length)];},
    rand(min,max){return Math.floor(Math.random()*(max-min+1))+min;},
    comb(n,k){if(k>n)return 0;if(k===0||k===n)return 1;let r=1;for(let i=0;i<k;i++)r=r*(n-i)/(i+1);return Math.round(r);},


    // === SOPORTE DE DIFICULTAD ===
    getDifficulty() {
        return (window.GameState && GameState.difficulty) || 'normal';
    },
    getRange() {
        const diff = this.getDifficulty();
        return CONFIG.DIFFICULTY_RANGES[diff] || CONFIG.DIFFICULTY_RANGES.normal;
    },
    drand() {
        const r = this.getRange();
        return this.rand(r.min, r.max);
    },
    dpick() {
        const r = this.getRange();
        return this.pick(r.operators);
    },

    // === GENERAR OPCIONES MULTIPLE CHOICE ===
    generateChoices(correct) {
        const choices = [correct];
        const numCorrect = parseInt(correct);
        if (!isNaN(numCorrect)) {
            const offsets = [-3,-2,-1,1,2,3,5,10];
            while (choices.length < 4) {
                const offset = this.pick(offsets);
                const wrong = String(numCorrect + offset);
                if (!choices.includes(wrong) && numCorrect + offset >= 0) {
                    choices.push(wrong);
                }
            }
        } else {
            while (choices.length < 4) {
                const wrong = this.rand(1, 50) + '';
                if (!choices.includes(wrong)) choices.push(wrong);
            }
        }
        return this.shuffle(choices);
    },
    withChoices(q) {
        return { ...q, type: 'choice', options: this.generateChoices(q.a) };
    },
    linear(grade){
        const g={
            5:()=>{const a=this.rand(3,10),b=this.rand(2,6),c=this.rand(2,8);return{q:"Steve tiene "+a+" bloques y gana "+b+" por arbol. Cuantos tras "+c+"?",a:String(a+b*c),hint:a+" + "+b+"*"+c};},
            6:()=>{const b=this.rand(3,8),c=this.rand(2,6),d=this.rand(2,5);return{q:"Si "+b+" herr cuestan "+b*c+" ling, cuantas con "+b*c*d+"?",a:String(c*d),hint:b*c*d+"/"+b*c+"*"+b};},
            7:()=>{const m=this.pick([2,3,4,5,6,7,8]),x=this.rand(2,8);return{q:"Si y = "+m+"x, y cuando x = "+x+"?",a:String(m*x),hint:m+" * "+x};},
            8:()=>{const m=this.pick([2,3,4,5]),b=this.rand(1,10),x=this.rand(2,6);return{q:"Si y = "+m+"x + "+b+", y cuando x = "+x+"?",a:String(m*x+b),hint:m+"("+x+") + "+b};},
            9:()=>{const x1=this.rand(0,3),y1=this.rand(1,5),m=this.rand(1,4),x2=x1+this.rand(1,4),y2=y1+m*(x2-x1),b=y1-m*x1;return{q:"Ecuacion por ("+x1+","+y1+") y ("+x2+","+y2+"). y=mx+b",a:"y="+m+"x"+(b<0?"-"+Math.abs(b):"+"+b),hint:"m=("+y2+"-"+y1+")/("+x2+"-"+x1+")"};},
            10:()=>{const f=this.pick([5000,10000,15000]),v=this.pick([100,200,300,500]),x=this.rand(5,20);return{q:"Servicio $"+f+" fijo + $"+v+"/unidad. Total por "+x+"?",a:String(v*x+f),hint:v+"*"+x+" + "+f};},
            11:()=>{const ops=[()=>{const m=this.rand(2,5),b=this.rand(1,10),x=this.rand(2,8);return{q:"f(x)="+m+"x+"+b+", f("+x+")=?",a:String(m*x+b),hint:m+"("+x+")+"+b};},()=>{const a=this.rand(1,4),c=this.rand(2,8),b=this.rand(1,5);return{q:"Sistema: "+a+"x+y="+(a*c+b)+", x="+c+". y=?",a:String(b),hint:a+"("+c+")+y="+(a*c+b)};}];return this.pick(ops)();}
        };
        return this.shuffle(Array.from({length:6},()=>g[grade]()));
    },

    quadratic(grade){
        const g={
            5:()=>{const x=this.rand(2,9);return{q:"Si y=x^2, y cuando x="+x+"?",a:String(x*x),hint:x+"^2"};},
            6:()=>{const x=this.rand(3,10);return{q:"Cuadrado lado "+x+". Area?",a:String(x*x),hint:x+"^2"};},
            7:()=>{const x=this.rand(3,10);return{q:"Si y=x^2, y cuando x="+x+"?",a:String(x*x),hint:x+"^2"};},
            8:()=>{const ops=[()=>{const x=this.rand(2,6),c=this.rand(1,5);return{q:"Si y=x^2+"+c+", y cuando x="+x+"?",a:String(x*x+c),hint:x+"^2 + "+c};},()=>{const x=this.rand(2,5),c=this.rand(1,5);return{q:"Si y="+c+"x^2, y cuando x="+x+"?",a:String(c*x*x),hint:c+" * "+x+"^2"};}];return this.pick(ops)();},
            9:()=>{const ops=[()=>{const v=this.rand(-3,3);return{q:"Vertices de y=x^2"+(v>=0?"+":"")+v+"?",a:"(0,"+v+")",hint:"Minimo de la parabola"};},()=>{const r=this.rand(2,6);return{q:"Raices de y=x^2-"+(r*r),a:"x="+r+", x=-"+r,hint:"x^2="+(r*r)};}];return this.pick(ops)();},
            10:()=>{const ops=[()=>{const r1=this.rand(1,5),r2=this.rand(1,5);return{q:"Resuelve x^2-"+(r1+r2)+"x+"+(r1*r2)+"=0",a:"x="+r1+", x="+r2,hint:"Factorizando"};},()=>{const r=this.rand(2,5);return{q:"Resuelve x^2-"+(r*r)+"=0",a:"x="+r+", x=-"+r,hint:"x^2="+(r*r)};}];return this.pick(ops)();},
            11:()=>{const ops=[()=>{const r1=this.rand(1,4),r2=-this.rand(1,4);return{q:"Resuelve x^2-"+(r1+r2)+"x+"+(-r1*r2)+"=0",a:"x="+r1+", x="+r2,hint:"Factorizando"};},()=>{const m=this.rand(2,5),x=this.rand(2,5),c=this.rand(1,5);return{q:"Composta f(x)=x^2, g(x)=x+"+c+". f(g("+x+"))?",a:String((x+c)*(x+c)),hint:"g("+x+")="+(x+c)+", f("+(x+c)+")="+((x+c)*(x+c))};}];return this.pick(ops)();}
        };
        return this.shuffle(Array.from({length:6},()=>g[grade]()));
    },

    probability(grade){
        const pct=(n,d)=>{const v=Math.round(n/d*10000)/100;return v===Math.floor(v)?v+"%":v.toFixed(2)+"%";};
        const g={
            5:()=>{const f=this.rand(1,5),t=10;return{q:"Cofre: "+f+" perlas y "+(t-f)+" bloques ("+t+"). Prob. perla?",a:pct(f,t),hint:f+"/"+t+" * 100"};},
            6:()=>{const f=this.rand(1,9),t=10;return{q:"Cofre "+f+" de "+t+" son diamantes. Prob.?",a:pct(f,t),hint:f+"/"+t+" * 100"};},
            7:()=>{const ops=[()=>{const f=this.rand(1,5),t=10;return{q:"Cofre: "+f+" perlas, "+(t-f)+" piedras. Prob. perla?",a:pct(f,t),hint:f+"/"+t+"*100"};},()=>{return{q:"Dado: prob. numero primo?",a:"50%",hint:"2,3,5 son primos de 6"};}];return this.pick(ops)();},
            8:()=>{const ops=[()=>{return{q:"2 dados: prob. suma par?",a:"50%",hint:"18/36 * 100"};},()=>{return{q:"Moneda 3 veces: prob. 2 caras?",a:"37.5%",hint:"3/8 * 100"};},()=>{const f=this.rand(2,5),t=10;return{q:"Cofre: "+f+" perlas de "+t+". Prob.?",a:pct(f,t),hint:f+"/"+t+"*100"};}];return this.pick(ops)();},
            9:()=>{const ops=[()=>{return{q:"2 dados: prob. doble 6?",a:"2.78%",hint:"1/36 * 100"};},()=>{return{q:"Moneda 4 veces: prob. 2 caras?",a:"37.5%",hint:"6/16 * 100"};},()=>{return{q:"2 dados: prob. suma > 9?",a:"16.67%",hint:"6/36 * 100"};}];return this.pick(ops)();},
            10:()=>{const ops=[()=>{const n=this.rand(5,12),k=this.rand(2,4);return{q:"De "+n+" personas, formas de elegir "+k+"?",a:String(this.comb(n,k)),hint:"C("+n+","+k+")"};},()=>{const pa=Math.round(Math.random()*50+10)/100,pb=Math.round(Math.random()*50+10)/100;return{q:"P(A)="+pa+", P(B)="+pb+", indep. P(A y B)?",a:pct(Math.round(pa*pb*10000),10000),hint:pa+" * "+pb};}];return this.pick(ops)();},
            11:()=>{const ops=[()=>{const n=this.rand(5,10),k=this.rand(2,5);return{q:"De "+n+" personas, formas de elegir "+k+"?",a:String(this.comb(n,k)),hint:"C("+n+","+k+")"};},()=>{const n=this.rand(4,7);let f=1;for(let i=2;i<=n;i++)f*=i;return{q:"De "+n+" personas, formas de ordenarlas?",a:String(f),hint:n+"!"};}];return this.pick(ops)();}
        };
        return this.shuffle(Array.from({length:6},()=>g[grade]()));
    },

    mixed(grade){
        const gens=[this.linear,this.quadratic,this.probability];
        const r=[];
        for(let i=0;i<6;i++){const q=gens[i%3].call(this,grade)[0];r.push({...q,q:"REPASO: "+q.q});}
        return r;
    }
};

QuestionBank.overworld._generator=(grade)=>QuestionGenerators.linear(grade);
QuestionBank.mines._generator=(grade)=>QuestionGenerators.quadratic(grade);
QuestionBank.nether._generator=(grade)=>QuestionGenerators.probability(grade);
QuestionBank.end._generator=(grade)=>QuestionGenerators.mixed(grade);

window.QuestionGenerators=QuestionGenerators;
// === WRAPPER: Agregar choices a todas las preguntas ===
const _origLinear = QuestionGenerators.linear.bind(QuestionGenerators);
QuestionGenerators.linear = function(g) { return _origLinear(g).map(q => QuestionGenerators.withChoices(q)); };
const _origQuadratic = QuestionGenerators.quadratic.bind(QuestionGenerators);
QuestionGenerators.quadratic = function(g) { return _origQuadratic(g).map(q => QuestionGenerators.withChoices(q)); };
const _origProbability = QuestionGenerators.probability.bind(QuestionGenerators);
QuestionGenerators.probability = function(g) { return _origProbability(g).map(q => QuestionGenerators.withChoices(q)); };
const _origMixed = QuestionGenerators.mixed.bind(QuestionGenerators);
QuestionGenerators.mixed = function(g) { return _origMixed(g).map(q => QuestionGenerators.withChoices(q)); };
