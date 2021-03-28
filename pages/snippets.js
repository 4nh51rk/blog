import { getAllFilesFrontMatter } from '@/lib/mdx'
import siteMetadata from '@/data/siteMetadata'
import SnippetLayout from '@/layouts/SnippetLayout'
import { PageSeo } from '@/components/SEO'

export async function getStaticProps() {
    const snippets = await getAllFilesFrontMatter('snippets')

    return { props: { snippets } }
}

export default function Snippets({ snippets }) {
    return (
        <>
            <PageSeo
                title={`snippets - ${siteMetadata.author}`}
                description={siteMetadata.description}
                url={`${siteMetadata.siteUrl}/snippets`}
            />
            <SnippetLayout snippets={snippets} title="All Snippets" />
        </>
    )
}