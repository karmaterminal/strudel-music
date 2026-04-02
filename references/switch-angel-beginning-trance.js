
samples('github:switchangel/beginningtrance')

function blockArrange(patArr, modifiers = []) {
  return stack(
    ...patArr.map(([pat, maskPat]) => {
      pat = [pat].flat()

      return maskPat.fmap(m => {
        return stack(...pat.map(p => {

          if (m == 0) {
            return
          }
          const ms = m.toString()
          let newPat = p

          if (ms.includes('R')) {
            newPat = newPat.restart(1)
          }
          if (ms.includes('B')) {
            newPat = newPat.rev().mul(speed(-1))
          }
          modifiers.forEach(([mod, callback]) => {
            if (mod(ms)) {
              newPat = callback(newPat)
            }
          })
          return newPat
        }).filter(Boolean))
      }).innerJoin()
    }).flat()
  )
}

// @TITLE In the Beginning There was Trance @By Switch Angel
setCpm(136/4) 
register('acidenv', (x, pat) => pat.lpf(100)
  .lpenv(x * 9).lps(.2).lpd(.12)
)
register('o', (orb, pat) => pat.orbit(orb))
const sc = 'g:minor'


const energy = slider(0.527)


//   ░██████                     ░██   ░██               ░██              ░███                                     ░██ 
//  ░██   ░██                          ░██               ░██             ░██░██                                    ░██ 
// ░██         ░██    ░██    ░██ ░██░████████  ░███████  ░████████      ░██  ░██  ░████████   ░████████  ░███████  ░██ 
//  ░████████  ░██    ░██    ░██ ░██   ░██    ░██    ░██ ░██    ░██    ░█████████ ░██    ░██ ░██    ░██ ░██    ░██ ░██ 
//         ░██  ░██  ░████  ░██  ░██   ░██    ░██        ░██    ░██    ░██    ░██ ░██    ░██ ░██    ░██ ░█████████ ░██ 
//  ░██   ░██    ░██░██ ░██░██   ░██   ░██    ░██    ░██ ░██    ░██    ░██    ░██ ░██    ░██ ░██   ░███ ░██        ░██ 
//   ░██████      ░███   ░███    ░██    ░████  ░███████  ░██    ░██    ░██    ░██ ░██    ░██  ░█████░██  ░███████  ░██ 
//                                                                                                  ░██                
//                                                                                            ░███████        

const lead =  n("<0 4 0 9 7>*16".add("<0>*2")).scale(sc).trans(-12)
.o(3).acidenv(.4).room(.3)

const lead2 =  n("<0 4 0 9 7>*16".add("<0>*2")).scale(sc).trans(-12)
.o(3).s("sawtooth").acidenv(energy).lpq(0.1).room(.3)

const lead3 =  n("<0 4 0 9 7>*16".add("<7 _ _ 6 5 _ _ 6>*2")).scale(sc).trans(-12)
.o(3).s('sawtooth').acidenv(energy).lpq(0.1)

const lead4 =  n("<0 4 0 9 7>*16".add("<7 _ _ 6 5 _ _ 6>*2")).scale(sc).trans(-12)
.o(3).s('sawtooth').acidenv(energy).lpq(0.1)
  .delay(.3).pan(rand).diode("1:.7")
  .fm(.5).fmwave('white')

         
                                                                                                                    
const bass =  n("<0>*2").scale("g:minor").trans(-24)
.detune(rand)
.seg(16).clip(.9)
.o(4).s("supersaw").acidenv(energy)

const bass2 =  n("<7 _ _ 6 5 _ < 3 5> < 4 6>>*2").scale(sc).trans(-24)
.detune(rand)
.seg(16).clip(.9)
.o(4).s("supersaw").acidenv(energy).diode("2:.4")


const riser = s("white!4").att(.3).o(6).gain(.06).hpf(900)

const clap =  s("cp!4").o(8).gain(.5).diode("2:.2").hpf(800).bank('tr909').room(.8)

const top = s("<- oh:2>*8").delay(.5).o(5).hpf(400).gain(.6)

const kick = s("sbd!4").sometimesBy(.01, x => x.ply("2"))
  .duck("3:4:5:6").dec(.3)
  .duckdepth(.8).penv(36).pdec(.2)
  .duckattack(.16)



const vox = s("ctvox").o(7).gain(.8).room(.4)
              .n("<0 - - -  - - - 1  - - 2 -  - - 3 -  - 4 - -  - - - -  - - - 6  - - - -  - - 8 -  - - - -  - - - 5  - - - -  - - 9 -  - - - -  - - 10 -  - - - - - - - -  - - - -  - - - 13 - - - -  - - - 17  - - - -  - - - 16  - - - -  - - - 16  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - ->")
              
$B: blockArrange(
  [ 
    [[vox],      "<F F F F  F F F F  F F F F  F F F F  F F F F  F F F F  F F F F  F F F F  F F F F  F F F F  F F F F  F F F F  F F F F  F F F F  F F F F  F F F F  F F F F  F F F F  F F F F  F F F F  F F F F  F F F F  F F F F  F F F F  F F F F  F F F F  F F F F  F F F F  F F F F  F F F F  F F F F  F F F F  F F F F>"],
    [[kick],     "<- - - -  - - - -  - - - -  - - - -  - - - -  F F F F  F F F -  F F F F  F F F -  F F F F  F F F F  F F F F  F F F F  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  F F F F  F F F F  F F F F  F F F -  F F F F  F F F F  F F F F  F F F F  F F F F  F F F F  - - - -  - - - -  - - - -  - - - ->"],
    [[lead],     "<- - - -  T T T T  F F F F  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - ->"],
    [[lead2],    "<- - - -  - - - -  - - - -  F F F F  F F F F  F F F F  F F F F  F F F F  F F F F  F F F F  F F F F  F F F F  F F F F  F F F F  D D D D  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  F F F F  F F F F  F F F F  F F F F  F F F F  F F F F>"],
    [[lead3],    "<- - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  F F F F  F F F F  F F F F  F F F D  D D D D  D D D D  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - ->"],     
    [[lead4],    "<- - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  F F F F  F F F F  F F F F  F F F F  F F F F  F F F F  - - - -  - - - -  - - - -  - - - -  - - - -  - - - ->"],     
    [[bass],     "<- - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  F F F F  F F F F  F F F F  F F F F  F F F F  F F F F  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  F F F F  F F F F  - - - -  - - - -  - - - -  - - - ->"],
   [[bass2],     "<- - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  F F F F  F F F F  F F F F  F F F F  F F F F  F F F F  F F F F  F F F F  - - - -  - - - -  - - - -  - - - -  - - - -  - - - ->"],    
    [[top],      "<- - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  F F F F  F F F F  F F F F  F F F B  - - - -  - - - -  - - - -  - - - -  F F F F  F F F -  F F F F  F F F F  F F F F  F F F B  F F F F  F F F F  F F F F  F F F F  F F F F  F F F F  F F F F  F F F F  F F F F  F F F F>"],
  [[riser],      "<- - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  F F F F  F F F F  - - - -  - - - -  - - - -  - - - -  - - - -  F F F -  - - - -  - - - -  - - - -  - - - -  F F F F  F F F F  F F F F  F F F F  - - - -  F F F F  - - - -  - - - -  - - - -  - - - ->"],    
  [[clap],       "<- - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  - - - -  F F F F  F F F F  F F F F  F F F F  - - - -  - - - -  - - - -  - - - -  - - - -  - - - ->"],    
  ],
  //ADD CUSTOM BINDINGS
  [[(m) => m.includes('S') , (x) => x.stretch(1)],
   [(m) => m.includes('T') , (x) => x.transpose(12)],
   [(m) => m.includes('D') , (x) => x.delay(.15)]
  ]
)
  //TURN THIS ON TO LOOP FOREVER
  // .ribbon(116,16)
  //VOLUME CONTROL
  .mul(postgain(1))
