# wavetable-generator

Simple command line tool for generating antialiased wavetables of various bit depths and lengths.

## Usage

`wavegen --wave=saw --type=int16 --length=2048 -a saw.json`

Supported waveforms are `saw|sine|square|tri` and supported output types are `float|int32|int16|int8|uint32|uint16|uint8`. The `-a` flag generates an audio file in addition to the JSON output, which is intended for copy-pasting into wherever your heart desires.

## Method

Nothing fancy at all, just additive synthesis. Longer wavetables will of course include more harmonics.
