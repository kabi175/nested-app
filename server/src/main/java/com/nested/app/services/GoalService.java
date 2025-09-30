package com.nested.app.services;

import com.nested.app.dto.GoalDTO;
import java.util.List;

public interface GoalService {
  List<GoalDTO> getAllGoals();

  GoalDTO createGoal(GoalDTO goalDTO);

  GoalDTO updateGoal(GoalDTO goalDTO) throws Exception;
}
