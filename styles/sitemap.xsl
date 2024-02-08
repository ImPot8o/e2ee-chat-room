<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:template match="/">
    <html>
      <head>
        <title>ECMC Sitemap</title>
        <link rel="stylesheet" href="/styles/style.css" type="text/css" />
        <style type="text/css">
          h1 {
            font-size: 24px;
            margin-bottom: 20px;
          }
          table {
            border-collapse: collapse;
            width: 100%;
          }
          th {
            background-color: #333333;
            text-align: left;
          }
          th, td {
            padding: 10px;
            border: 1px solid #ccc;
          }
          tr:hover {
            background-color: #312c20;
          }
          .url {
            font-weight: bold;
            color: #cc8b00;
          }
          .lastmod {
            font-style: italic;
            color: #cc8b00;
          }
          .changefreq {
            text-transform: capitalize;
            color: #cc8b00;
          }
          .priority {
            color: #cc8b00;
          }
        </style>
      </head>
      <body>
        <h1>ECMC Sitemap</h1>
        <table>
          <thead>
            <tr>
              <th>URL</th>
              <th>Last Modified</th>
              <th>Change Frequency</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody>
            <xsl:for-each select="//url">
              <tr>
                <td><a href="{loc}" class="url"><xsl:value-of select="loc"/></a></td>
                <td class="lastmod"><xsl:value-of select="lastmod"/></td>
                <td class="changefreq"><xsl:value-of select="changefreq"/></td>
                <td class="priority"><xsl:value-of select="priority"/></td>
              </tr>
            </xsl:for-each>
          </tbody>
        </table>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
