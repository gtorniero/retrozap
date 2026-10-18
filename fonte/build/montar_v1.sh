#!/bin/sh
# monta a V1 (para arrastar na Cloudflare): pasta retrozap-v1/public
set -e
D=$(cd "$(dirname "$0")/.." && pwd)
python3 "$D/build/v1.py"
RZ_SRC=zapped_v1.html RZ_OUT=retrozap-v1 python3 "$D/build/build.py"
RZ_OUT=retrozap-v1 python3 "$D/build/pages.py" > /dev/null
rm -rf "$D/retrozap-v1/functions"
python3 - "$D/retrozap-v1/public" <<'PY'
import sys, re, os
P = sys.argv[1]
f = os.path.join(P, 'privacidade.html'); s = open(f, encoding='utf-8').read()
s = re.sub(r'<h2>2\. Comparação com outros grupos \(só números\)</h2>\s*<p>.*?</p>', '<h2>2. Nada sobre o grupo é enviado</h2>\n<p>O site não envia mensagens, nomes, telefones nem números sobre o seu grupo para nenhum servidor. Tudo acontece no seu navegador e é descartado quando você fecha a página.</p>', s, flags=re.S)
open(f, 'w', encoding='utf-8').write(s)
f = os.path.join(P, 'blog', 'privacidade-ao-analisar-conversas-do-whatsapp.html'); s = open(f, encoding='utf-8').read()
s = re.sub(r'<h2>E a comparação com outros grupos\?</h2>\s*<p>.*?</p>\s*', '', s, flags=re.S).replace(' (só a comparação com outros grupos fica de fora)', '')
open(f, 'w', encoding='utf-8').write(s)
print('legais v1 ok')
PY
RZ_OUT=retrozap-v1 python3 "$D/build/og.py"
node --check "$D/build/prod_check.js"
