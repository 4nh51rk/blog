import { getAllFilesFrontMatter } from '@/lib/mdx'
import siteMetadata from '@/data/siteMetadata'
import ListLayout from '@/layouts/ListLayout'
import { PageSeo } from '@/components/SEO'

export async function getStaticProps() {
    const snippets = await getAllFilesFrontMatter('snippets')

    return { props: { snippets } }
}

export default function Snippets({ snippets }) {
    console.log('snippets', snippets)
    return (
        <>
            <PageSeo
                title={`Snippets - ${siteMetadata.author}`}
                description={siteMetadata.description}
                url={`${siteMetadata.siteUrl}/snippets`}
            />
            <h1>hi</h1>
        </>
    )
}