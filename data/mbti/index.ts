
// Analysts
import INTJ_logs from './INTJ/logs';
import INTJ_combos from './INTJ/combos';
import INTP_logs from './INTP/logs';
import INTP_combos from './INTP/combos';
import ENTJ_logs from './ENTJ/logs';
import ENTJ_combos from './ENTJ/combos';
import ENTP_logs from './ENTP/logs';
import ENTP_combos from './ENTP/combos';

// Diplomats
import INFJ_logs from './INFJ/logs';
import INFJ_combos from './INFJ/combos';
import INFP_logs from './INFP/logs';
import INFP_combos from './INFP/combos';
import ENFJ_logs from './ENFJ/logs';
import ENFJ_combos from './ENFJ/combos';
import ENFP_logs from './ENFP/logs';
import ENFP_combos from './ENFP/combos';

// Sentinels
import ISTJ_logs from './ISTJ/logs';
import ISTJ_combos from './ISTJ/combos';
import ISFJ_logs from './ISFJ/logs';
import ISFJ_combos from './ISFJ/combos';
import ESTJ_logs from './ESTJ/logs';
import ESTJ_combos from './ESTJ/combos';
import ESFJ_logs from './ESFJ/logs';
import ESFJ_combos from './ESFJ/combos';

// Explorers
import ISTP_logs from './ISTP/logs';
import ISTP_combos from './ISTP/combos';
import ISFP_logs from './ISFP/logs';
import ISFP_combos from './ISFP/combos';
import ESTP_logs from './ESTP/logs';
import ESTP_combos from './ESTP/combos';
import ESFP_logs from './ESFP/logs';
import ESFP_combos from './ESFP/combos';

// Aggregating Logs
export const MBTI_LOGS: Record<string, string[]> = {
  'INTJ': INTJ_logs, 'INTP': INTP_logs, 'ENTJ': ENTJ_logs, 'ENTP': ENTP_logs,
  'INFJ': INFJ_logs, 'INFP': INFP_logs, 'ENFJ': ENFJ_logs, 'ENFP': ENFP_logs,
  'ISTJ': ISTJ_logs, 'ISFJ': ISFJ_logs, 'ESTJ': ESTJ_logs, 'ESFJ': ESFJ_logs,
  'ISTP': ISTP_logs, 'ISFP': ISFP_logs, 'ESTP': ESTP_logs, 'ESFP': ESFP_logs,
};

// Aggregating Combinations
export const COMBINATION_LOGS: Record<string, string[]> = {
  ...INTJ_combos, ...INTP_combos, ...ENTJ_combos, ...ENTP_combos,
  ...INFJ_combos, ...INFP_combos, ...ENFJ_combos, ...ENFP_combos,
  ...ISTJ_combos, ...ISFJ_combos, ...ESTJ_combos, ...ESFJ_combos,
  ...ISTP_combos, ...ISFP_combos, ...ESTP_combos, ...ESFP_combos,
};
