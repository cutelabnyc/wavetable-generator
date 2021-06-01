# wavetable-generator

Simple command line tool for generating antialiased wavetables of various bit depths and lengths.

## Usage

`wavegen --wave=saw --type=int16 --length=2048 -a saw.json`

Supported waveforms are `saw|sine|square|tri` and supported output types are `float|int32|int16|int8|uint32|uint16|uint8`. The `-a` flag generates an audio file in addition to the JSON output, which is intended for copy-pasting into wherever your heart desires.

## Output

`wavegen` will generate a JSON file that describes how the audio was generated in addition to the samples themselves.

```json
{
  "length": 16,
  "wave": "saw",
  "format": "int16",
  "out": [0, 32767, 20509, 21292, 14360, 12506, 7282, 4140, 0, -4141, -7283, -12508, -14362, -21294, -20511, -32768]
}
```

## Method

Nothing fancy at all, just additive synthesis. Longer wavetables will of course include more harmonics.
