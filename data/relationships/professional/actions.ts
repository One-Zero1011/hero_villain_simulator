
import { RolePairKey } from '../../../types/index';

export const PROFESSIONAL_HOUSING_ACTIONS: Record<string, Partial<Record<RolePairKey, string[]>>> = {
  '스승과 제자': {
    'HERO_HERO': [
      "아직 자세가 흐트러졌다.",
      "많이 성장했구나.",
      "(존경의 눈빛)",
      "가르침을 주십시오!",
      "(뒷짐 지고 흐뭇해한다)"
    ],
    'VILLAIN_VILLAIN': [
      "악당의 미학을 배워라.",
      "더 잔인해져야 해.",
      "하산하거라.",
      "아직 멀었군.",
      "(사악한 웃음을 전수한다)"
    ],
    'COMMON': [
      "(90도로 인사한다)",
      "(어깨를 두드려준다)",
      "배움에는 끝이 없지."
    ]
  },
  '계약 관계': {
    'COMMON': [
      "입금 확인했습니다.",
      "비즈니스일 뿐이야.",
      "(악수를 청한다)",
      "계약 위반이야.",
      "(계산기를 두드린다)"
    ]
  }
};
