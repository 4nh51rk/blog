import fs from 'fs'
import hydrate from 'next-mdx-remote/hydrate'
import { getFiles, getFileBySlug, getAllFilesFrontMatter, formatSlug } from '@/lib/mdx'
import PostLayout from '@/layouts/PostLayout'
import MDXComponents from '@/components/MDXComponents'
import PageTitle from '@/components/PageTitle'
import generateRss from '@/lib/generate-rss'

export async function getStaticPaths() {
  const snippets = await getFiles('snippets')

  return {
    paths: snippets.map((p) => ({
      params: {
        slug: formatSlug(p),
      },
    })),
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const allSnippets = await getAllFilesFrontMatter('snippets')
  const snipIndex = allSnippets.findIndex((snip) => snip.slug === params.slug)
  const prev = allSnippets[snipIndex + 1] || null
  const next = allSnippets[snipIndex - 1] || null
  const snippets = await getFileBySlug('snippets', params.slug)

  // rss
  const rss = generateRss(allSnippets)
  fs.writeFileSync('./public/index.xml', rss)

  return { props: { snippets, prev, next } }
}

export default function Snippets({ snippets, prev, next }) {
  const { mdxSource, frontMatter } = snippets
  const content = hydrate(mdxSource, {
    components: MDXComponents,
  })

  return (
    <>
      {frontMatter.draft !== true ? (
        <PostLayout frontMatter={frontMatter} prev={prev} next={next}>
          {content}
        </PostLayout>
      ) : (
        <div className="mt-24 text-center">
          <PageTitle>
            Under Construction{' '}
            <span role="img" aria-label="roadwork sign">
              🚧
            </span>
          </PageTitle>
        </div>
      )}
    </>
  )
}
