import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MessageCircle, Network, Pencil, X } from 'lucide-react';
import { AppActions } from '../App';
import { categoryMeta, Person } from '../data/people';

export function PersonModal({ person, onClose, actions }: {
  person: Person | null;
  onClose: () => void;
  actions: AppActions;
}) {
  return (
    <AnimatePresence>
      {person && (
        <motion.div className="modal-layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div
            className="person-modal"
            initial={{ y: 48, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 24, scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.24 }}
          >
            <button className="modal-close" onClick={onClose} aria-label="閉じる">
              <X size={18} />
            </button>
            <div className="modal-profile">
              <img src={person.avatar} alt={person.name} />
              <div>
                <p className="modal-name">{person.name}</p>
                <p className="modal-handle">{person.handle}</p>
                <span style={{ color: categoryMeta[person.category].color, background: categoryMeta[person.category].tint }}>
                  {categoryMeta[person.category].label}
                </span>
              </div>
              <strong>{person.score}</strong>
            </div>
            <div className="modal-grid">
              <button onClick={() => actions.go('memo', person.id)}><Pencil size={17} />メモ</button>
              <button onClick={() => actions.go('meeting', person.id)}><Calendar size={17} />記録</button>
              <button onClick={() => actions.go('common', person.id)}><Network size={17} />共通</button>
              <button onClick={() => actions.go('detail', person.id)}><MessageCircle size={17} />詳細</button>
            </div>
            <button className="primary-button" onClick={() => actions.setCenter(person.id)}>
              この人を中心に見る
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
