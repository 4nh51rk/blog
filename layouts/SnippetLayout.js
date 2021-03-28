import Link from '@/components/Link'
import Tag from '@/components/Tag'
import siteMetdata from '@/data/siteMetadata'

const snippetDateTemplate = { year: 'numeric', month: 'long', day: 'numeric' }

export default function SnippetLayout({ snippets, title }) {
    return (
        <>
            <div className="divide-y">
                <ul class="grid grid-cols-2">
                    {!snippets.length && 'No snippets found.'}
                    {snippets.map((frontMatter) => {
                        const { slug, date, title, summary, tags } = frontMatter
                        return (
                            <li key={slug} className="py-4">
                                <article className="space-y-2 xl:grid xl:grid-cols-4 xl:space-y-0 xl:items-baseline">
                                    <div className="space-y-3 xl:col-span-3">
                                        <div>
                                            <h3 className="text-2xl font-bold leading-8 tracking-tight">
                                                <Link href={`/snippets/${slug}`} className="text-gray-900 dark:text-gray-100">
                                                    {title}
                                                </Link>
                                            </h3>
                                            <div className="flex flex-wrap">
                                                {tags.map((tag) => (
                                                    <Tag key={tag} text={tag} />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="prose text-gray-500 max-w-none dark:text-gray-400">
                                            {summary}
                                        </div>
                                        <dl>
                                            <dt className="sr-only">Published on</dt>
                                            <dd className="text-base font-medium leading-6 text-gray-500 dark:text-gray-400">
                                                <time dateTime={date}>
                                                    {new Date(date).toLocaleDateString(siteMetdata.locale, snippetDateTemplate)}
                                                </time>
                                            </dd>
                                        </dl>
                                    </div>

                                </article>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </>
    )
}
