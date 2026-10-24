# Gera src/historia.js para o painel: commits, dias e horas estimadas de trabalho (pelo histórico do git).
# Horas = soma dos intervalos entre commits seguidos com menos de 90 min (subestima: não conta o tempo antes do 1º commit de cada sessão).
import subprocess, json, sys, os, re, datetime as d
git = lambda *a: subprocess.run(['git', *a], capture_output=True, text=True).stdout.strip()
# cópia rasa (só os últimos commits) daria números menores: busca o histórico todo antes de contar
if git('rev-parse', '--is-shallow-repository') == 'true': subprocess.run(['git', 'fetch', '-q', '--unshallow', 'origin'], capture_output=True)
t = [d.datetime.fromisoformat(l) for l in subprocess.run(['git', 'log', '--reverse', '--format=%aI'], capture_output=True, text=True).stdout.split()]
h, sessoes = 0, 1 if t else 0
for a, b in zip(t, t[1:]):
    g = (b - a).total_seconds()
    if g < 5400: h += g
    else: sessoes += 1
o = {'commits': len(t), 'dias': len({x.astimezone(d.timezone(d.timedelta(hours=-3))).date() for x in t}), 'horas': round(h / 3600, 1), 'sessoes': sessoes,
     'primeiro': t[0].date().isoformat() if t else '', 'ultimo': t[-1].date().isoformat() if t else ''}
# se mesmo assim o histórico veio incompleto, mantém a versão publicada (nunca diminui)
ant = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src', 'historia.js')
try:
    velho = json.loads(re.search(r'= (\{.*\});', open(ant).read()).group(1))
    if velho.get('commits', 0) > o['commits']: o = velho
except Exception: pass
open(sys.argv[1], 'w').write('// gerado por fonte/build/historia.py (não editar)\nexport const HISTORIA = ' + json.dumps(o) + ';\n')
