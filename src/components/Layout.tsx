import * as React from 'react';
import { Link } from 'gatsby';
import { rhythm, scale } from '../utils/typography';

class Layout extends React.Component<any> {
  render() {
    const { location, title, children, description } = this.props;

    const rootPath = `${__PATH_PREFIX__}/`;
    let header;

    if (location.pathname === rootPath) {
      header = (
        <>
          <h1
            style={{
              ...scale(1.5),
              marginBottom: 0,
              marginTop: 0,
            }}
          >
            <Link
              style={{
                boxShadow: `none`,
                textDecoration: `none`,
                color: `inherit`,
              }}
              to={`/`}
            >
              {title}
            </Link>
          </h1>
          <h3 style={{ marginTop: 0 }}>{description}</h3>
        </>
      );
    } else {
      header = (
        <h3
          style={{
            fontFamily: `Montserrat, sans-serif`,
            marginTop: 0,
            marginBottom: rhythm(-1),
          }}
        >
          <Link
            style={{
              boxShadow: `none`,
              textDecoration: `none`,
              color: `inherit`,
            }}
            to={`/`}
          >
            {title}
          </Link>
        </h3>
      );
    }

    return (
      <div
        style={{
          marginLeft: `auto`,
          marginRight: `auto`,
          maxWidth: rhythm(48),
          padding: `${rhythm(1.5)} ${rhythm(1.5)}`,
        }}
      >
        {header}
        {children}
        <footer>© {new Date().getFullYear()}</footer>
      </div>
    );
  }
}

export default Layout;
