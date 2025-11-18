package com.nested.app.controllers;

import com.nested.app.dto.PortfolioGoalDTO;
import com.nested.app.dto.PortfolioOverallDTO;
import com.nested.app.services.PortfolioService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/portfolio")
@RequiredArgsConstructor
public class PortfolioController {

  private final PortfolioService portfolioService;

  @GetMapping("/overall")
  public ResponseEntity<PortfolioOverallDTO> overall() {
    return ResponseEntity.ok(portfolioService.getOverallPortfolio());
  }

  @GetMapping("/goals")
  public ResponseEntity<List<PortfolioGoalDTO>> goals() {
    return ResponseEntity.ok(portfolioService.getGoalsPortfolio());
  }

  @GetMapping("/goals/{goalId}")
  public ResponseEntity<PortfolioGoalDTO> goal(@PathVariable Long goalId) {
    var dto = portfolioService.getGoalPortfolio(goalId);
    if (dto == null) return ResponseEntity.notFound().build();
    return ResponseEntity.ok(dto);
  }
}
