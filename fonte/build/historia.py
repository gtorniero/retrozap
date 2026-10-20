# Gera src/historia.js para o painel: commits, dias e horas estimadas de trabalho (pelo histórico do git).
# Horas = soma dos intervalos entre commits seguidos com menos de 90 min (subestima: não conta o tempo antes do 1º commit de cada sessão).
import subprocess, json, sys, datetime as d
t = [d.datetime.fromisoformat(l) for l in subprocess.run(['git', 'log', '--reverse', '--format=%aI'], capture_output=True, text=True).stdout.split()]
h, sessoes = 0, 1 if t else 0
for a, b in zip(t, t[1:]):
    g = (b - a).total_seconds()
    if g < 5400: h += g
    else: sessoes += 1
o = {'commits': len(t), 'dias': len({x.astimezone(d.timezone(d.timedelta(hours=-3))).date() for x in t}), 'horas': round(h / 3600, 1), 'sessoes': sessoes,
     'primeiro': t[0].date().isoformat() if t else '', 'ultimo': t[-1].date().isoformat() if t else ''}
open(sys.argv[1], 'w').write('// gerado por fonte/build/historia.py (não editar)\nexport const HISTORIA = ' + json.dumps(o) + ';\n')
