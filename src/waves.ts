export enum WaveTypes {
  'sine',
  'saw',
  'square',
  'tri'
}

export enum WaveFormats {
  'float',
  'int8',
  'int16',
  'int32',
  'uint8',
  'uint16',
  'uint32'
}

function fillSine(out: Float32Array) {
  const phaseFactor = 2 * Math.PI / out.length
  for (let i = 0; i < out.length; i++) {
    const phase = phaseFactor * i
    out[i] = Math.sin(phase)
  }
}

function sawAtPhase(phase: number, fs: number): number {
  let out = 0
  for (let h = 1; h <= fs; h++) {
  // for (let h = 1; h <= 1; h++) {
    out += Math.sin(phase * h) / h
  }
  return out
}

function fillSaw(out: Float32Array) {
  for (let i = 0; i < out.length; i++) {
    const phaseFactor = 2 * Math.PI / out.length
    out[i] = sawAtPhase(phaseFactor * i, out.length / 2)
  }
}

function fillSquare(out: Float32Array) {
  for (let i = 0; i < out.length; i++) {
    const phaseFactor = 2 * Math.PI / out.length
    out[i] = sawAtPhase((phaseFactor * i) - Math.PI, out.length / 2) - sawAtPhase(phaseFactor * i, out.length / 2)
  }
}

function fillTri(out: Float32Array) {
  for (let i = 0; i < out.length; i++) {
    out[i] = 0
    const fac = 2 * Math.PI * i / out.length
    for (let h = 1; h <= out.length / 2; h += 2) {
      out[i] += Math.cos(h * fac) / (h * h)
    }
  }
}

function normalize(out: Float32Array) {
  let max = 0
  for (let i = 0; i < out.length; i++) {
    if (Math.abs(out[i]) > max) {
      max = Math.abs(out[i])
    }
  }

  if (max > 0) {
    for (let i = 0; i < out.length; i++) {
      out[i] /= (max)
    }
  }
}

export function makeWave(length: number, type?: (keyof typeof WaveTypes), format?: (keyof typeof WaveFormats)): number[] {
  const intLen = Math.floor(length)
  const out = new Float32Array(intLen)
  switch (type) {
  case 'saw':
    fillSaw(out)
    break
  case 'square':
    fillSquare(out)
    break
  case 'tri':
    fillTri(out)
    break
  case 'sine':
  default:
    fillSine(out)
  }
  normalize(out)

  const ret = new Array(intLen)
  let shift = 0
  let mask = 0

  switch (format) {
  case 'int32':
  case 'uint32':
    shift = 31
    mask = 0x7FFFFFFF
    break
  case 'int16':
  case 'uint16':
    shift = 15
    mask = 0x00007FFF
    break
  case 'int8':
  case 'uint8':
    shift = 7
    mask = 0x0000007F
    break
  }

  const offset = (format === 'uint32' || format === 'uint16' || format === 'uint8') ? -(~0 >> shift << shift) : 0

  for (let i = 0; i < ret.length; i++) {
    if (format === 'float') {
      ret[i] = out[i]
    } else if (out[i] >= 0) {
      ret[i] = Math.floor((out[i] * mask)) + offset
    } else {
      ret[i] = Math.floor((-out[i] * (~0 >> shift << shift))) + offset
    }
  }

  return ret
}
