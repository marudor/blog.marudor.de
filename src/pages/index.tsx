import * as React from 'react';
import { graphql, Link } from 'gatsby';
import { rhythm } from '../utils/typography';
import Layout from '../components/Layout';
import SEO from '../components/Seo';

class BlogIndex extends React.Component<any> {
  render() {
    const { data } = this.props;
    const { title, description } = data.site.siteMetadata;
    const posts: any[] = data.allMdx.edges;

    return (
      <Layout
        location={this.props.location}
        title={title}
        description={description}
      >
        <SEO title="All posts" keywords={['bahn', 'marudor', 'javascript']} />
        {posts.map(({ node }) => {
          const title = node.frontmatter.title || node.fields.slug;

          return (
            <article key={node.fields.slug}>
              <h3
                style={{
                  marginBottom: rhythm(1 / 4),
                }}
              >
                <Link to={node.fields.slug}>{title}</Link>
              </h3>
              <small>{node.frontmatter.date}</small>
              <p dangerouslySetInnerHTML={{ __html: node.excerpt }} />
            </article>
          );
        })}
      </Layout>
    );
  }
}

export default BlogIndex;

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
        description
      }
    }
    allMdx(
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { frontmatter: { published: { ne: false } } }
    ) {
      edges {
        node {
          excerpt
          fields {
            slug
          }
          frontmatter {
            date(formatString: "DD.MM.YYYY")
            title
            published
          }
        }
      }
    }
  }
`;
