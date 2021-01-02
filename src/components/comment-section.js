import React, { useRef, useEffect } from 'react';
import { useStaticQuery, graphql } from 'gatsby';

function CommentSection () {
  const commentSectionRef = useRef()

  const data = useStaticQuery(graphql`
		query CommentsQuery {
			site {
				siteMetadata {
					repo
				}
			}
		}
	`);

  useEffect(() => {
    const scriptEl = document.createElement('script');
    scriptEl.src = 'https://utteranc.es/client.js';
    scriptEl.async = true;
    scriptEl.setAttribute('id', 'utterances')
    scriptEl.setAttribute('repo', data.site.siteMetadata.repo);
    scriptEl.setAttribute('issue-term', 'pathname');
    scriptEl.setAttribute('label', 'comments');
    scriptEl.setAttribute('theme', 'github-light');
    scriptEl.setAttribute('crossorigin', 'anonymous');

    if(commentSectionRef && commentSectionRef.current) {
      commentSectionRef.current.appendChild(scriptEl)
    } else {
      console.log(`Error adding utterances comments on: ${commentSectionRef}`)
    }
  }, [data]);

  return <div ref={commentSectionRef} className="comments"/>;
};

export default CommentSection;