import {Command, flags} from '@oclif/command'
import * as fs from 'fs'
import {WaveTypes, makeWave, WaveFormats} from './waves'
import {WaveFile} from 'wavefile'

const waveOptions: (keyof typeof WaveTypes)[] = [
  'sine',
  'saw',
  'square',
  'tri',
]

const typeOptions: (keyof typeof WaveFormats)[] = [
  'float',
  'int8',
  'int16',
  'int32',
  'uint8',
  'uint16',
  'uint32',
]

class Wavegen extends Command {
  static description = 'describe the command here'

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({char: 'v'}),
    help: flags.help({char: 'h'}),

    wave: flags.enum<keyof typeof WaveTypes>({options: waveOptions, description: 'kind of waveform', default: 'sine'}),
    type: flags.enum<keyof typeof WaveFormats>({options: typeOptions, description: 'output type', default: 'int32'}),

    length: flags.integer({char: 'l', description: 'wavetable length', default: 1024}),
  }

  static args = [{name: 'output'}]

  async run() {
    const {args, flags} = this.parse(Wavegen)

    const out = makeWave(flags.length, flags.wave, flags.type)

    // const outStr = JSON.stringify({
    //   length: Math.floor(flags.length),
    //   wave: flags.wave,
    //   format: 'float',
    //   out: [...out.values()],
    // })

    // await new Promise<void>((resolve, reject) => {
    //   fs.writeFile(args.output, outStr, {encoding: 'utf8'}, err => {
    //     if (err) {
    //       reject(err)
    //     } else {
    //       resolve()
    //     }
    //   })
    // })

    const wav = new WaveFile()
    wav.fromScratch(1, 44100, '32', [...out])

    await new Promise<void>((resolve, reject) => {
      fs.writeFile(args.output, wav.toBuffer(), {encoding: 'utf8'}, err => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }
}

export = Wavegen
