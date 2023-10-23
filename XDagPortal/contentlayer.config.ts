import { defineDocumentType, ComputedFields, makeSource } from 'contentlayer/source-files'
import { writeFileSync } from 'fs'
import readingTime from 'reading-time'
import GithubSlugger from 'github-slugger'
import path from 'path'
// Remark packages
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import {
	remarkExtractFrontmatter,
	remarkCodeTitles,
	remarkImgToJsx,
	extractTocHeadings,
} from 'pliny/mdx-plugins/index.js'
// Rehype packages
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeKatex from 'rehype-katex'
import rehypeCitation from 'rehype-citation'
import rehypePrismPlus from 'rehype-prism-plus'
import rehypePresetMinify from 'rehype-preset-minify'
import siteMetadata from './data/siteMetadata'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer.js'

// const root = "file://" + process.cwd();
const root = process.cwd()
const isProduction = process.env.NODE_ENV === 'production'
// console.log( '.....root:', root )

const computedFields: ComputedFields = {
	readingTime: { type: 'json', resolve: ( doc ) => readingTime( doc.body.raw ) },
	slug: { type: 'string', resolve: ( doc ) => doc._raw.flattenedPath.replace( /^.+?(\/)/, '' ), },
	path: { type: 'string', resolve: ( doc ) => doc._raw.flattenedPath, },
	filePath: { type: 'string', resolve: ( doc ) => doc._raw.sourceFilePath, },
	toc: { type: 'string', resolve: ( doc ) => extractTocHeadings( doc.body.raw ) },
}

/**
 * Count the occurrences of all tags across blog posts and write to json file
 */
function createTagCount( allApps ) {
	const tagCount: Record<string, number> = {}
	allApps.forEach( ( file ) => {
			if ( file.tags && (!isProduction || file.draft !== true) ) {
				file.tags.forEach( ( tag ) => {
					const formattedTag = GithubSlugger.slug( tag )
					if ( formattedTag in tagCount ) {
						tagCount[ formattedTag ] += 1
					} else {
						tagCount[ formattedTag ] = 1
					}
				} )
			}
		}
	)
	writeFileSync( './app/tag-data.json', JSON.stringify( tagCount ) )
}

function createSearchIndex( allBlogs ) {
	if (
		siteMetadata?.search?.provider === 'kbar' &&
		siteMetadata.search.kbarConfig.searchDocumentsPath
	) {
		writeFileSync(
			`public/${ siteMetadata.search.kbarConfig.searchDocumentsPath }`,
			JSON.stringify( allCoreContent( sortPosts( allBlogs ) ) )
		)
		console.log( 'Local search index generated...' )
	}
}

export const Author = defineDocumentType( () => ({
	name: 'Author',
	filePathPattern: 'author/**/*.mdx',
	contentType: 'mdx',
	fields: {
		name: { type: 'string', required: true },
		tags: { type: 'list', of: { type: 'string' }, default: [] },
		avatar: { type: 'string' },
		summary: { type: 'string' },
		company: { type: 'string' },
		email: { type: 'string' },
		twitter: { type: 'string' },
		telegram: { type: 'string' },
		discord: { type: 'string' },
		github: { type: 'string' },
		layout: { type: 'string' },
		draft: { type: 'boolean' },
	},
	computedFields,
}) )


export const DApp = defineDocumentType( () => (
	{
		name: 'DApp',
		filePathPattern: 'dapp/**/*.mdx',
		contentType: 'mdx',
		fields: {
			title: { type: 'string', required: true },
			date: { type: 'date', required: true },
			tags: { type: 'list', of: { type: 'string' }, default: [] },
			lastMod: { type: 'date' },
			draft: { type: 'boolean' },
			summary: { type: 'string' },
			images: { type: 'json' },
			authors: { type: 'list', of: { type: 'string' } },
			layout: { type: 'string' },
			bibliography: { type: 'string' },
			canonicalUrl: { type: 'string' },
		},
		computedFields: {
			...computedFields,
			structuredData: {
				type: 'json',
				resolve: ( doc ) => ({
					'@context': 'https://schema.org',
					'@type': 'BlogPosting',
					headline: doc.title,
					datePublished: doc.date,
					dateModified: doc.lastMod || doc.date,
					description: doc.summary,
					image: doc.images ? doc.images[ 0 ] : siteMetadata.socialBanner,
					url: `${ siteMetadata.siteUrl }/${ doc._raw.flattenedPath }`,
				}),
			},
		},
	}) )

export const Community = defineDocumentType( () => ({
	name: 'Community',
	filePathPattern: 'community/**/*.mdx',
	contentType: 'mdx',
	fields: {
		name: { type: 'string', required: true },
		tags: { type: 'list', of: { type: 'string' }, default: [] },
		avatar: { type: 'string' },
		occupation: { type: 'string' },
		company: { type: 'string' },
		email: { type: 'string' },
		twitter: { type: 'string' },
		linkedin: { type: 'string' },
		github: { type: 'string' },
		layout: { type: 'string' },
		date: { type: 'date' },
		lastMod: { type: 'date' },
		draft: { type: 'boolean' },
		summary: { type: 'string' },
		bibliography: { type: 'string' },
		title: { type: 'string' },
	},
	computedFields,
}) )

// const pathCwd = "file://" +  process.cwd().replace(/\\/g, "/");
// const pathCwd = "file:///D:/code/LulianovicCode/XDAG-Hub/XDagPortal/";
// console.log( 'absolute apth:<<<>>>>>>\n', pathCwd )

const source = makeSource( {
		contentDirPath: 'data',
		documentTypes: [ Author, DApp, Community ],
		mdx: {
			// "file:///" + cwd: process.cwd(),
			cwd: process.cwd(),
			// cwd: pathCwd,
			remarkPlugins: [
				remarkExtractFrontmatter,
				remarkGfm,
				remarkCodeTitles,
				remarkMath,
				remarkImgToJsx,
			],
			rehypePlugins: [
				rehypeSlug,
				rehypeAutolinkHeadings,
				rehypeKatex,
				[ rehypeCitation, { path: path.join( root, 'data' ) } ],
				[ rehypePrismPlus, { defaultLanguage: 'js', ignoreMissing: true } ],
				rehypePresetMinify,
			],
		},
		// onSuccess: async ( importData ) => {
		// 	console.log('.......1:.....')
		// 	const { allDApps } = await importData();
		// 	console.log('.......2:.....')
		// 	createTagCount( allDApps );
		// 	createSearchIndex( allDApps );
		// },
	}
)

export default source;

