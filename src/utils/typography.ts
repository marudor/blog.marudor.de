import './global.css';
import Typography from 'typography';
import Wordpress2016 from 'typography-theme-wordpress-2016';

Wordpress2016.overrideThemeStyles = () => {
  return {
    table: {
      wordWrap: 'anywhere',
    },
    th: {
      wordWrap: 'normal',
    },
    a: {
      color: 'var(--link-color)',
    },
    body: {
      backgroundColor: 'var(--bg-color)',
      color: 'var(--text-color)',
      fontFamily: '"Source Code Pro", Monaco, monospace',
    },
    'a.gatsby-resp-image-link': {
      boxShadow: `none`,
    },
    pre: {
      overflow: 'auto',
      lineHeight: '1.15rem',
    },
  };
};

Wordpress2016.googleFonts = [
  {
    name: 'Source Code Pro',
    styles: ['400', '700'],
  },
];
const typography = new Typography(Wordpress2016);

// Hot reload typography in development.
if (process.env.NODE_ENV !== `production`) {
  typography.injectStyles();
}

export default typography;
export const rhythm = typography.rhythm;
export const scale = typography.scale;
