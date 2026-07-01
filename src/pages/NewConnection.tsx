import { CheckCircle2, Smartphone } from 'lucide-react';
import { AppActions } from '../App';

export function NewConnection({ actions }: { actions: AppActions }) {
  return (
    <div className="page-stack">
      <section className="new-connection-card">
        <Smartphone size={70} />
        <h1>スマホを重ねて<br />つながりを記録しよう</h1>
        {['近づけるだけで自動でつながります', 'いつ、どこで会ったかを記録', 'つながりの強さが育っていきます'].map((text) => (
          <p key={text}><CheckCircle2 size={18} />{text}</p>
        ))}
      </section>
      <button className="primary-button" onClick={() => actions.go('qr')}>QRコードで交換</button>
    </div>
  );
}
