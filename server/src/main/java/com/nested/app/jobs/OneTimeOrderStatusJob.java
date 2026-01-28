package com.nested.app.jobs;

import com.nested.app.services.OrderSchedulerService;
import java.util.Arrays;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class OneTimeOrderStatusJob implements ApplicationRunner {
    private static final String[] ORDER_IDS = {
        "mfp_2bf4a014606e4f6782f17cb64e6c04bd",
        "mfp_7025d54a6aea4bbdb4015b676235cb89"
    };
    private static boolean hasRun = false;
    private final OrderSchedulerService orderSchedulerService;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        if (hasRun) {
            log.info("OneTimeOrderStatusJob already executed. Skipping.");
            return;
        }
        log.info("Scheduling order status jobs for one-time order IDs: {}", Arrays.toString(ORDER_IDS));
        orderSchedulerService.scheduleOrderStatusJobs(Arrays.asList(ORDER_IDS));
        hasRun = true;
    }
}
