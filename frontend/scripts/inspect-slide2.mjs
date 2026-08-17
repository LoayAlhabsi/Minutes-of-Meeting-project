import FS from 'node:fs'
import JSZip from 'jszip'

const z = await JSZip.loadAsync(
  FS.readFileSync('public/templates/presentation-blank.pptx'),
)
const xml = await z.file('ppt/slides/slide2.xml').async('string')
const parts = xml.split('<p:sp>')
console.log('shape count', parts.length - 1)
parts.slice(1).forEach((part, i) => {
  const name = (part.match(/name="([^"]+)"/) || [])[1]
  const id = (part.match(/id="(\d+)"/) || [])[1]
  const texts = [...part.matchAll(/<a:t[^>]*>([^<]*)<\/a:t>/g)].map((m) => m[1])
  const off = part.match(/<a:off x="(\d+)" y="(\d+)"/) || []
  const ext = part.match(/<a:ext cx="(\d+)" cy="(\d+)"/) || []
  console.log(JSON.stringify({ i: i + 1, id, name, x: off[1], y: off[2], cx: ext[1], cy: ext[2], texts }))
})

// also check slide1 title box for style reference
const s1 = await z.file('ppt/slides/slide1.xml').async('string')
const tIdx = s1.indexOf('العنوان')
console.log('\n--- slide1 title context ---')
console.log(s1.slice(tIdx - 600, tIdx + 200))
