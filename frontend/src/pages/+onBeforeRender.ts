export { onBeforeRender }

function onBeforeRender(pageContext: { urlPathname: string }) {
  const urlPathname = pageContext.urlPathname

  return {
    pageContext: {
      pageProps: {
        route: urlPathname,
      },
    },
  }
}
