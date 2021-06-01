import {Command, flags} from '@oclif/command'
import * as fs from 'fs'
import * as path from 'path'
import {WaveTypes, makeWave, WaveFormats, convert} from './waves'
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
    version: flags.version({char: 'v'}),
    help: flags.help({char: 'h'}),

    wave: flags.enum<keyof typeof WaveTypes>({
      char: 'w',
      options: waveOptions,
      description: 'kind of waveform',
      default: 'sine'
    }),

    type: flags.enum<keyof typeof WaveFormats>({
      char: 't',
      options: typeOptions,
      description: 'output type',
      default: 'int32'
    }),

    length: flags.integer({char: 'l', description: 'wavetable length', default: 1024}),

    audio: flags.boolean({char: 'a', description: 'generate an audio (wav) file additionally'})
  }

  static args = [{name: 'output'}]

  async run() {
    const {args, flags} = this.parse(Wavegen)

    const out = makeWave(flags.length, flags.wave)
    const conv = convert(out, flags.type)

    const outStr = JSON.stringify({
      length: Math.floor(flags.length),
      wave: flags.wave,
      format: flags.type,
      out: [...conv.values()],
    })

    await new Promise<void>((resolve, reject) => {
      fs.writeFile(args.output, outStr, {encoding: 'utf8'}, err => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })

    if (flags.audio) {
      const pathObj = path.parse(args.output)
      pathObj.ext = '.wav'
      pathObj.base = pathObj.name + pathObj.ext
      const audioOutputPath = path.format(pathObj)

      let depth = '32'
      let retype: keyof typeof WaveFormats = 'int32'
      if (flags.type === 'int16' || flags.type === 'uint16') {
        depth = '16'
        retype = 'int16'
      } else if (flags.type === 'int8' || flags.type === 'uint8') {
        depth = '8'
        retype = 'uint8'
      }

      const reconv = convert(out, retype)
      const wav = new WaveFile()
      wav.fromScratch(1, 44100, depth, [...reconv])

      await new Promise<void>((resolve, reject) => {
        fs.writeFile(audioOutputPath, wav.toBuffer(), {encoding: 'utf8'}, err => {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        })
      })
    }
  }
}

export = Wavegen
