module.exports = {
  siteMetadata: {
    title: 'marudors blog',
    author: 'marudor',
    description: 'Bahnkram, Javascript, experiment',
    siteUrl: 'https://blog.marudor.de/',
    social: {
      twitter: 'marudor',
      github: 'marudor',
    },
  },
  plugins: [
    'gatsby-plugin-typescript',
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        path: `${__dirname}/content/blog`,
        name: 'blog',
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        path: `${__dirname}/content/assets`,
        name: 'assets',
      },
    },
    {
      resolve: 'gatsby-plugin-mdx',
      options: {
        extensions: ['.mdx', '.md'],
        // a workaround to solve mdx-remark plugin compat issue
        // https://github.com/gatsbyjs/gatsby/issues/15486
        plugins: ['gatsby-remark-images', 'gatsby-plugin-twitter'],
        gatsbyRemarkPlugins: [
          {
            resolve: 'gatsby-remark-embedder',
            options: {
              customTransformers: [
                // Your custom transformers
              ],
              services: {
                // The service-specific options by the name of the service
              },
            },
          },
          {
            resolve: 'gatsby-remark-images',
            options: {
              maxWidth: 590,
            },
          },
          {
            resolve: 'gatsby-remark-responsive-iframe',
            options: {
              wrapperStyle: 'margin-bottom: 1.0725rem',
            },
          },
          {
            resolve: 'gatsby-remark-copy-linked-files',
          },

          {
            resolve: 'gatsby-remark-smartypants',
          },
        ],
      },
    },
    'gatsby-transformer-sharp',
    'gatsby-plugin-sharp',
    {
      resolve: 'gatsby-plugin-google-analytics',
      options: {
        trackingId: 'A-121422835-3',
      },
    },
    {
      resolve: 'gatsby-plugin-feed',
      options: {
        query: `
          {
            site {
              siteMetadata {
                title
                description
                siteUrl
              }
            }
          }
        `,
        feeds: [
          {
            serialize: ({ query: { site, allMdx } }) => {
              return allMdx.edges.map((edge) => {
                return Object.assign({}, edge.node.frontmatter, {
                  description: edge.node.excerpt,
                  data: edge.node.frontmatter.date,
                  url: site.siteMetadata.siteUrl + edge.node.fields.slug,
                  guid: site.siteMetadata.siteUrl + edge.node.fields.slug,
                  custom_elements: [{ 'content:encoded': edge.node.html }],
                });
              });
            },

            /* if you want to filter for only published posts, you can do
             * something like this:
             * filter: { frontmatter: { published: { ne: false } } }
             * just make sure to add a published frontmatter field to all posts,
             * otherwise gatsby will complain
             **/
            query: `
            {
              allMdx(
                limit: 1000,
                sort: { order: DESC, fields: [frontmatter___date] },
                filter: { frontmatter: { published: { ne: false } } },
              ) {
                edges {
                  node {
                    fields { slug }
                    frontmatter {
                      title
                      date
                      published
                    }
                    html
                  }
                }
              }
            }
            `,
            output: '/rss.xml',
            title: 'marudors blog RSS feed',
          },
        ],
      },
    },
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: 'marudors blog',
        short_name: 'marudors blog',
        start_url: '/',
        background_color: '#ffffff',
        theme_color: '#663399',
        display: 'minimal-ui',
        // icon: 'content/assets/gatsby-icon.png',
      },
    },
    'gatsby-plugin-offline',
    'gatsby-plugin-react-helmet',
    {
      resolve: 'gatsby-plugin-typography',
      options: {
        pathToConfigModule: 'src/utils/typography',
      },
    },
    {
      resolve: 'gatsby-redirect-from',
      options: {
        query: 'allMdx',
      },
    },
    'gatsby-plugin-meta-redirect',
    {
      resolve: 'gatsby-plugin-page-progress',
      options: {
        excludePaths: ['/'],
      },
    },
  ],
};
