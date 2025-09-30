package com.nested.app.services;

import com.nested.app.dto.ChildDTO;
import java.util.List;

public interface ChildService {
  List<ChildDTO> getAllChildren();

  ChildDTO createChild(ChildDTO childDTO);

  ChildDTO updateChild(ChildDTO childDTO);
}
