package com.nested.app.services;

import com.nested.app.dto.HoldingDTO;
import java.util.List;

public interface HoldingService {
  List<HoldingDTO> getHoldingsByGoal(String goalId);
}
