import { AppActions } from '../App';

export function QrCode({ actions }: { actions: AppActions }) {
  return (
    <div className="page-stack">
      <section className="qr-card">
        <h2>マイQRコード</h2>
        <div className="fake-qr">
          {Array.from({ length: 121 }).map((_, index) => <i key={index} className={index % 3 === 0 || index % 7 === 0 ? 'on' : ''} />)}
          <b>B</b>
        </div>
        <p>相手に読み取ってもらいましょう</p>
      </section>
      <button className="secondary-button" onClick={() => actions.go('new')}>シェアする</button>
    </div>
  );
}
