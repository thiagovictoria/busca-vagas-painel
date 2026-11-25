# Gera src/components/Garimpeiro.jsx: cena larga com garimpeiro articulado (poses + SMIL, funciona em todos os navegadores)
import json, math
DUR = 11  # segundos

def P(**k): return k
# curvado sobre a bateia: ombros baixos (tronco "encurtado" = inclinado para a frente), cabeca baixa,
# joelhos dobrados e a bateia rente a agua
base = dict(
 head=(400,192), neck=(400,208), shL=(373,214), shR=(427,214), hipL=(385,268), hipR=(415,268),
 kneeL=(373,304), kneeR=(427,304), footL=(381,342), footR=(419,342),
 elL=(354,252), elR=(446,252), haL=(366,292), haR=(434,292), pan=(400,298,0), nug=(410,295), sorriso=0)

def pose(b=None, **mud):
    p=dict(base if b is None else b); p.update(mud); return p
def mover(p, dy=0, dx=0, chaves=None):
    q=dict(p)
    for k,v in p.items():
        if isinstance(v,tuple) and (chaves is None or k in chaves):
            q[k]=(v[0]+dx, v[1]+dy)+v[2:]
    return q

P0 = pose()
# peneirando: a bateia vai e volta, os bracos e a cabeca acompanham
P0a = pose(head=(395,193), haL=(348,288), haR=(418,300), elL=(344,250), elR=(436,256), pan=(384,296,-9), nug=(394,293))
P0b = pose(head=(405,193), haL=(382,300), haR=(452,288), elL=(364,256), elR=(456,250), pan=(416,296,9), nug=(426,293))
# achou: ainda curvado, ergue um pouco a bateia e olha de perto
P1 = pose(head=(400,188), haL=(368,282), haR=(432,282), elL=(356,246), elR=(444,246), pan=(400,288,0), nug=(410,285))
P2 = pose(P1, haR=(410,280), elR=(438,252), nug=(410,276))
# de pe, braco direito no alto com a pepita, bateia baixa na mao esquerda
P3 = pose(head=(400,136), neck=(400,162), shL=(373,172), shR=(427,172), hipL=(385,252), hipR=(415,252),
          kneeL=(382,296), kneeR=(418,296), elL=(356,210), haL=(346,246), elR=(446,136), haR=(454,94),
          pan=(336,254,-28), nug=(457,86), sorriso=1, baixa=0)
P4 = mover(P3, dy=16, chaves=[k for k in P3 if k not in ('footL','footR')])  # agacha antes do pulo
P4 = pose(P4, kneeL=(370,304), kneeR=(430,304))
P5 = mover(P3, dy=-58, chaves=[k for k in P3 if k not in ('footL','footR')])  # no ar
P5 = pose(P5, kneeL=(381,238), kneeR=(419,238), footL=(377,280), footR=(423,280), elL=(346,140), haL=(336,108), pan=(330,112,-40),
          elR=(448,78), haR=(458,36), nug=(461,28))
P7 = mover(P5, dy=10)
P7 = pose(P7, footL=(377,290), footR=(423,290))

timeline = [
 (0.00,P0),(0.05,P0a),(0.10,P0b),(0.15,P0a),(0.20,P0b),(0.25,P0a),(0.30,P0b),(0.33,P0),
 (0.38,P1),(0.44,P1),(0.48,P2),(0.55,P3),(0.60,P4),(0.64,P5),(0.68,P4),(0.72,P7),(0.76,P4),(0.81,P3),(0.90,P3),(0.96,P0),(1.00,P0)]
tempos=[t for t,_ in timeline]
KT=";".join(f"{t:.3f}" for t in tempos)
KS=";".join(["0.45 0 0.55 1"]*(len(tempos)-1))
def anim(attr, valores):
    return f'<animate attributeName="{attr}" dur="{DUR}s" repeatCount="indefinite" calcMode="spline" keyTimes="{KT}" keySplines="{KS}" values="{";".join(valores)}" />'
def animT(tipo, valores):
    return f'<animateTransform attributeName="transform" type="{tipo}" dur="{DUR}s" repeatCount="indefinite" calcMode="spline" keyTimes="{KT}" keySplines="{KS}" values="{";".join(valores)}" additive="sum" />'
f=lambda pt: f"{pt[0]:.1f} {pt[1]:.1f}"
def caminho(*juntas): return [ "M"+" L".join(f(p[j]) for j in juntas) for _,p in timeline]
def stat(*juntas): return "M"+" L".join(f(P0[j]) for j in juntas)
def suspensorio(lado):
    out=[]
    for _,p in timeline:
        s=p['shL' if lado=='L' else 'shR']; h=p['hipL' if lado=='L' else 'hipR']; d=8 if lado=='L' else -8
        out.append(f"M{s[0]+d:.1f} {s[1]+2:.1f} L{h[0]+d*0.6:.1f} {h[1]-2:.1f}")
    return out
def tronco():
    return [f"M{f(p['shL'])} L{f(p['shR'])} L{f(p['hipR'])} L{f(p['hipL'])} Z" for _,p in timeline]

def inverso(janelas):
    kt=[0]; v=["1"]
    for a,b in janelas:
        kt += [a, a+0.005, b, b+0.005]; v += ["1","0","0","1"]
    kt.append(1); v.append("1")
    return f'<animate attributeName="opacity" dur="{DUR}s" repeatCount="indefinite" calcMode="linear" keyTimes="{";".join(f"{x:.3f}" for x in kt)}" values="{";".join(v)}" />'
# janelas (opacidade em degraus)
def degraus(nome, janelas):
    # janelas: lista de (inicio, fim) em fracao do ciclo
    kt=[0]; v=["0"]
    for a,b in janelas:
        kt += [a, a+0.005, b, b+0.005]; v += ["0","1","1","0"]
    kt.append(1); v.append("0")
    return f'<animate attributeName="opacity" dur="{DUR}s" repeatCount="indefinite" calcMode="linear" keyTimes="{";".join(f"{x:.3f}" for x in kt)}" values="{";".join(v)}" />'

CAMISA="#e9dfc6"; PELE="#c68b5e"; CALCA="#3c5148"; CHAPEU="#d9b45a"; FAIXA="#8a5a2b"
L=[]
a=L.append
a('<svg viewBox="0 0 800 400" preserveAspectRatio="xMidYMax slice" className="cena-garimpo" aria-hidden="true">')
# fundo: morros, mata e margem
a('<path d="M0 230 C120 190 220 205 320 220 S520 180 640 205 800 215 800 215 V400 H0Z" fill="#12392f" />')
a('<path d="M0 262 C140 238 260 252 380 258 S600 236 800 252 V400 H0Z" fill="#164336" />')
for x,h in [(60,70),(110,95),(150,60),(640,85),(690,110),(740,70),(250,50),(560,55)]:
    a(f'<path d="M{x} {250-h} L{x-22} 262 L{x+22} 262Z" fill="#0d2f26" />')
a('<path d="M0 290 C160 280 300 286 400 286 S640 280 800 290 V400 H0Z" fill="#1b5141" />')  # areia/margem molhada
# rio (atras das pernas)
a('<path d="M0 312 C200 304 600 304 800 312 V400 H0Z" fill="#174a3d" />')

# --- garimpeiro ---
a('{animado ? null : null}')
def el(tag, attrs, anims=""):
    at=" ".join(f'{k}="{v}"' for k,v in attrs.items())
    return f'<{tag} {at}>{anims}</{tag}>' if anims else f'<{tag} {at} />'
a(el('path',{"d":stat('hipL','kneeL','footL'),"stroke":CALCA,"strokeWidth":"19","strokeLinecap":"round","strokeLinejoin":"round","fill":"none"}, '{animado && <>'+anim("d",caminho('hipL','kneeL','footL'))+'</>}'))
a(el('path',{"d":stat('hipR','kneeR','footR'),"stroke":CALCA,"strokeWidth":"19","strokeLinecap":"round","strokeLinejoin":"round","fill":"none"}, '{animado && <>'+anim("d",caminho('hipR','kneeR','footR'))+'</>}'))
a(el('path',{"d":f"M{f(P0['shL'])} L{f(P0['shR'])} L{f(P0['hipR'])} L{f(P0['hipL'])} Z","fill":CAMISA,"stroke":CAMISA,"strokeWidth":"14","strokeLinejoin":"round"}, '{animado && <>'+anim("d",tronco())+'</>}'))
for lado in 'LR':
    s0=P0['shL' if lado=='L' else 'shR']; h0=P0['hipL' if lado=='L' else 'hipR']; d=8 if lado=='L' else -8
    a(el('path',{"d":f"M{s0[0]+d} {s0[1]+2} L{h0[0]+d*0.6} {h0[1]-2}","stroke":FAIXA,"strokeWidth":"4","strokeLinecap":"round","opacity":".75"}, '{animado && <>'+anim("d",suspensorio(lado))+'</>}'))
a(el('path',{"d":stat('neck','head'),"stroke":PELE,"strokeWidth":"12","strokeLinecap":"round"}, '{animado && <>'+anim("d",caminho('neck','head'))+'</>}'))
# cabeca + chapeu (move junto com o ponto head)
hx,hy=P0['head']
desloc=[f"{p['head'][0]-hx:.1f} {p['head'][1]-hy:.1f}" for _,p in timeline]
a('<g>{animado && <>'+animT("translate",desloc)+'</>}')
a(f'<circle cx="{hx}" cy="{hy}" r="21" fill="{PELE}" />')
# rosto: olhando para baixo enquanto peneira (olhos fechados/baixos, chapeu caido sobre a testa);
# de frente quando levanta a pepita
a(f'<g opacity="0">{{animado && <>'+degraus("x",[(0.50,0.93)])+'</>}')
a(f'<circle cx="{hx-7}" cy="{hy+2}" r="2.2" fill="#2b1d14" /><circle cx="{hx+7}" cy="{hy+2}" r="2.2" fill="#2b1d14" />')
a('</g>')
a(f'<path d="M{hx-6} {hy+10} q6 4 12 0" fill="none" stroke="#2b1d14" strokeWidth="2.2" strokeLinecap="round" opacity="0">{{animado && <>'+degraus("x",[(0.50,0.55),(0.90,0.93)])+'</>}</path>')
a(f'<path d="M{hx-8} {hy+8} q8 12 16 0z" fill="#2b1d14" opacity="0">{{animado && <>'+degraus("x",[(0.55,0.90)])+'</>}</path>')
a(f'<g>{{animado && <>'+inverso([(0.50,0.93)])+'</>}')
a(f'<path d="M{hx-10} {hy+7} q3 2.5 6 0M{hx+4} {hy+7} q3 2.5 6 0" fill="none" stroke="#2b1d14" strokeWidth="2" strokeLinecap="round" />')
a(f'<path d="M{hx-4} {hy+15} h8" stroke="#2b1d14" strokeWidth="2" strokeLinecap="round" opacity=".6" />')
a('</g>')
# chapeu: desce sobre a testa quando a cabeca esta baixa
quedas=[f"0 {7 if p.get('baixa',1) else 0}" for _,p in timeline]
a('<g>{animado && <>'+animT("translate",quedas)+'</>}')
a(f'<ellipse cx="{hx}" cy="{hy-14}" rx="37" ry="7.5" fill="{CHAPEU}" />')
a(f'<rect x="{hx-17}" y="{hy-37}" width="34" height="25" rx="10" fill="{CHAPEU}" />')
a(f'<rect x="{hx-17}" y="{hy-22}" width="34" height="5" fill="{FAIXA}" />')
a('</g>')
a('</g>')
# bateia (mao esquerda) — centro + giro
px,py,_=P0['pan']
mv=[f"{p['pan'][0]-px:.1f} {p['pan'][1]-py:.1f}" for _,p in timeline]
gr=[f"{p['pan'][2]:.1f} {px} {py}" for _,p in timeline]
a('<g>{animado && <>'+animT("translate",mv)+'</>}<g>{animado && <>'+animT("rotate",gr)+'</>}')
a(f'<ellipse cx="{px}" cy="{py+2}" rx="47" ry="13" fill="#5a3d26" />')
a(f'<ellipse cx="{px}" cy="{py}" rx="39" ry="9" fill="#7a5636" />')
a(f'<ellipse cx="{px}" cy="{py}" rx="25" ry="5" fill="#8fb3a8" opacity=".6" />')
a('</g></g>')
# bracos: manga + antebraco + mao
for lado in 'LR':
    sh,elb,ha=('shL','elL','haL') if lado=='L' else ('shR','elR','haR')
    a(el('path',{"d":stat(sh,elb),"stroke":CAMISA,"strokeWidth":"15","strokeLinecap":"round","fill":"none"}, '{animado && <>'+anim("d",caminho(sh,elb))+'</>}'))
    a(el('path',{"d":stat(elb,ha),"stroke":PELE,"strokeWidth":"11","strokeLinecap":"round","strokeLinejoin":"round","fill":"none"}, '{animado && <>'+anim("d",caminho(elb,ha))+'</>}'))
    hx2,hy2=P0[ha]
    a(f'<circle cx="{hx2}" cy="{hy2}" r="7.5" fill="{PELE}">{{animado && <>'+anim("cx",[f"{p[ha][0]:.1f}" for _,p in timeline])+anim("cy",[f"{p[ha][1]:.1f}" for _,p in timeline])+'</>}</circle>')
# pepita: aparece na bateia, depois vai na mao direita
nx,ny=P0['nug']
mvn=[f"{p['nug'][0]-nx:.1f} {p['nug'][1]-ny:.1f}" for _,p in timeline]
a(f'<g opacity="0">{{animado && <>'+degraus("x",[(0.36,0.92)])+animT("translate",mvn)+'</>}')
a(f'<g transform="translate({nx} {ny}) scale(1.6)"><path d="M-5.4-.8-1.6-6l6.4.9 2 5.9-4.4 4.6-6.1-.9z" fill="#e0ac3f" /><path d="M-5.4-.8-1.6-6l6.4.9-4.3 3.6z" fill="#f7d58a" /></g>')
a('</g>')
# brilho na bateia
a(f'<path d="M0-8c.9 4.9 3.1 7.1 8 8-4.9.9-7.1 3.1-8 8-.9-4.9-3.1-7.1-8-8 4.9-.9 7.1-3.1 8-8z" transform="translate(424 276)" fill="#fff4d6" opacity="0">{{animado && <>'+degraus("x",[(0.37,0.46)])+'</>}</path>')
# rio na frente das pernas
a('<path d="M0 318 C100 312 200 322 300 316 S500 312 600 318 700 322 800 316 V400 H0Z" fill="#1a5244" opacity=".96" />')
a('<g className="cg-correnteza">')
for x,y,w in [(40,340,60),(180,356,90),(330,338,50),(470,350,80),(620,342,70),(720,362,50),(90,376,70),(540,378,90)]:
    a(f'<path d="M{x} {y}h{w}" stroke="#f3ecdc" strokeOpacity=".14" strokeWidth="2" strokeLinecap="round" />')
a('</g>')
a('<ellipse cx="400" cy="322" rx="46" ry="6" fill="none" stroke="#f3ecdc" strokeOpacity=".25" strokeWidth="1.5" />')
# respingos nas aterrissagens
for t0 in (0.68,0.76):
    for dx,dy,r in [(-40,-6,3.2),(-52,-16,2.2),(40,-6,3.2),(54,-16,2.2),(-20,-12,2),(22,-14,2)]:
        a(f'<circle cx="{400+dx}" cy="{318+dy}" r="{r}" fill="#9fd0c0" opacity="0">{{animado && <>'+degraus("x",[(t0,t0+0.03)])+'</>}</circle>')
# festa: faiscas em volta da mao no alto
for dx,dy,k in [(30,-20,1.3),(-30,-34,0.9),(46,18,0.8),(10,-50,0.7)]:
    a(f'<path d="M0-8c.9 4.9 3.1 7.1 8 8-4.9.9-7.1 3.1-8 8-.9-4.9-3.1-7.1-8-8 4.9-.9 7.1-3.1 8-8z" fill="#fff4d6" opacity="0" transform="translate({457+dx} {86+dy}) scale({k})">{{animado && <>'+degraus("x",[(0.56,0.60),(0.66,0.70),(0.78,0.88)])+'</>}</path>')
a('</svg>')
svg="\n      ".join(L).replace('{animado ? null : null}','')

jsx = '''// Gerado por um script (poses do garimpeiro + animacao SMIL, que funciona em todos os navegadores).
// Cena larga da entrada: na margem do rio, o garimpeiro peneira a bateia, ve o brilho, pega a pepita,
// levanta, agacha, pula duas vezes de alegria e volta a peneirar. Ciclo de %ds.
// Com "reduzir movimento" ligado no sistema, a cena fica parada (sem as animacoes).
import { useEffect, useState } from "react";

export default function Garimpeiro() {
  const [animado, setAnimado] = useState(true);
  useEffect(() => {
    try {
      const m = window.matchMedia("(prefers-reduced-motion: reduce)");
      const f = () => setAnimado(!m.matches);
      f();
      m.addEventListener("change", f);
      return () => m.removeEventListener("change", f);
    } catch { /* sem matchMedia: mantem animado */ }
  }, []);
  return (
      %s
  );
}
''' % (DUR, svg)
open('src/components/Garimpeiro.jsx','w').write(jsx)
print("ok", len(jsx))
