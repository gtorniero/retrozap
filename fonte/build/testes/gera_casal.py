import random, datetime as dt
random.seed(7)
A,B='Ana','Bruno'
fr={A:['te amo ❤️','bom dia amor','to com fome','saudade de vc 🥰','kkkkkk','desculpa amor','oq vamos jantar?','chegou em casa?','vc viu isso?','amorzinho 😘','<Mídia oculta>','figurinha omitida'],
    B:['te amo também','bom diaaa','kkkk','to saindo do trabalho','pizza hoje?','meu bem 💕','haha','desculpa a demora','áudio ocultado','vamos no cinema?','to morrendo de fome','saudades']}
l=[]
d=dt.datetime(2025,1,5,8)
while d<dt.datetime(2026,10,15):
    n=random.randint(15,45)+(120 if d.date() in (dt.date(2026,3,14),dt.date(2026,6,12),dt.date(2026,8,2)) else 0)+(15 if d.year==2026 else 0)
    t=d.replace(hour=7)
    for i in range(n):
        t+=dt.timedelta(minutes=random.randint(1,40)); a=random.choice([A,B]) if i else random.choice([A,A,B])
        l.append(f"[{t:%d/%m/%Y, %H:%M:%S}] {a}: {random.choice(fr[a])}")
    d+=dt.timedelta(days=1)
open(__import__('os').path.join(__import__('os').path.dirname(__file__), '_chat_casal.txt') + '','w').write('\n'.join(l))
print(len(l))
