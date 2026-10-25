import re, os, glob

HEAD = open("_partials/header.html").read()
FOOT = open("_partials/footer.html").read()
NAV_KEYS = ["HOME","GAMES","ASSETS","GALLERY","RELATED","AI","ABOUT","CONTACT"]

def header_for(active):
    h = HEAD
    for k in NAV_KEYS:
        h = h.replace("{NAV_%s}" % k, ' class="active" aria-current="page"' if k == active else "")
    return h

for src in sorted(glob.glob("_partials/src-*.html")):
    fname = os.path.basename(src).replace("src-", "", 1)
    raw = open(src).read()
    m = re.search(r"<body>(.*)</body>", raw, re.S)
    assert m, fname
    head_block = raw[:m.start()].strip()          # doctype..</head>
    body_inner = m.group(1).strip()               # everything between body tags
    am = re.search(r'<!--ACTIVE:(\w+)-->', body_inner)
    active = am.group(1) if am else ""
    body_inner = re.sub(r'\s*<!--ACTIVE:\w+-->', '', body_inner)
    out = head_block + "\n\n<body>\n\n" \
        + '<a class="skip-link" href="#main-content">Skip to main content</a>\n\n' \
        + header_for(active) + "\n\n" + body_inner + "\n\n" + FOOT.strip() + "\n"
    with open(fname, "w") as f:
        f.write(out)
    print("built", fname, "(active:", active or "-", ")")
