import '../utils/PrismSetup';
import * as React from 'react';
import { LiveEditor, LiveError, LivePreview, LiveProvider } from 'react-live';
import Highlight, { defaultProps } from 'prism-react-renderer';
import theme from 'prism-react-renderer/themes/nightOwl';

export const Code = ({ codeString, language, ...props }: any) => {
  if (props['react-live']) {
    let livePreview = <LivePreview />;

    if (props.code) {
      livePreview = <code>{livePreview}</code>;
    }

    return (
      <LiveProvider code={codeString}>
        <LiveEditor />
        <LiveError />
        {livePreview}
      </LiveProvider>
    );
  }

  return (
    <Highlight
      {...defaultProps}
      theme={theme}
      code={codeString}
      language={language}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre className={className} style={style}>
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line, key: i })}>
              <span
                style={{
                  display: 'table-cell',
                  textAlign: 'right',
                  paddingRight: '.5em',
                  userSelect: 'none',
                  opacity: 0.5,
                }}
              >
                {i + 1}
              </span>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token, key })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
};
