# Gera a V1 (drag and drop, sem servidor): sem "Crie sua categoria" e sem comparação entre grupos
import re, os
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
s = open(os.path.join(D, 'zapped.html'), encoding='utf-8').read()
def tira(a, b=''):
    global s
    assert s.count(a) == 1, (a[:80], s.count(a)); s = s.replace(a, b)
tira([l for l in s.split('\n') if 'class="optin"' in l and '<label' in l][0] + '\n')
tira("    comparar(state.data); // em segundo plano; a resposta aparece no resumo\n")
tira("  $('#cmp').onchange = e => { state.comparar = e.target.checked; };\n")
s = s.replace("A gente não recebe, não lê e não guarda nenhuma mensagem.", "A gente não recebe, não lê e não guarda nada.")
open(os.path.join(D, 'zapped_v1.html'), 'w', encoding='utf-8').write(s)
print('v1 ok')
