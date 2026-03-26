import { RootState } from '../store';
import { EligibilityStatus } from './protocolTypes';

export const selectInclusionCriteria = (state: RootState) => state.protocol.inclusionCriteria;

export const selectExclusionCriteria = (state: RootState) => state.protocol.exclusionCriteria;

export const selectJustifications = (state: RootState) => state.protocol.justifications;

export const selectCompletionPercent = (state: RootState): number => {
  const { inclusionCriteria, exclusionCriteria } = state.protocol;
  const total = inclusionCriteria.length + exclusionCriteria.length;
  const answered = inclusionCriteria.filter(i => i.status !== null).length +
                   exclusionCriteria.filter(i => i.status !== null).length;
  return Math.round((answered / total) * 100);
};

export const selectEligibilityStatus = (state: RootState): EligibilityStatus => {
  const { inclusionCriteria, exclusionCriteria } = state.protocol;
  const completionPercent = selectCompletionPercent(state);
  
  const failInclusion = inclusionCriteria.some(i => i.status === false && i.mandatory);
  const hitExclusion = exclusionCriteria.some(i => i.status === true && i.mandatory);
  
  if (completionPercent < 100) {
    return { text: 'Incomplete', class: 'pending' };
  }
  if (failInclusion || hitExclusion) {
    return { text: 'Protocol Deviation', class: 'deviation' };
  }
  return { text: 'Eligible', class: 'eligible' };
};
