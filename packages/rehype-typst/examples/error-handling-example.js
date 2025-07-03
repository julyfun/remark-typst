import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import remarkTypst from '../../remark-typst/index.js'
import rehypeTypst from '../index.js'

// Processor with error handling
const robustProcessor = unified()
  .use(remarkParse)
  .use(remarkTypst)
  .use(remarkRehype)
  .use(rehypeTypst, {
    fallbackToLatex: true,
    throwOnError: false,
    errorColor: '#ff6b6b'
  })
  .use(rehypeStringify)

// Test with potentially problematic math
const problematicMarkdown = `
# Error Handling Demo

## Valid Math
This works: $x^2 + y^2 = z^2$

## Invalid Typst (will fallback to LaTeX)
This might fail in Typst: $\\invalid{syntax}$

## Invalid Math (will show error)
This is completely wrong: $\\completely\\broken{math
`

robustProcessor.process(problematicMarkdown)
  .then(result => {
    console.log('Robust processing result:')
    console.log(String(result))
  })
  .catch(error => {
    console.error('Even robust processing failed:', error)
  })