(function () {
  'use strict';

  const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const engine = () => window.gsap;
  let resultTimeline = null;
  const elements = (target) => {
    if (typeof target === 'string') return Array.from(document.querySelectorAll(target));
    if (target instanceof Element) return [target];
    return Array.from(target || []);
  };
  const finish = (target, visible = true) => {
    elements(target).forEach((el) => {
      el.style.opacity = visible ? '1' : '0';
      el.style.visibility = visible ? 'visible' : 'hidden';
      el.style.transform = 'none';
    });
  };
  const animate = (target, from, to) => {
    const list = elements(target);
    if (!list.length || reduce() || !engine()) {
      finish(list);
      if (to && typeof to.onComplete === 'function') to.onComplete();
      return null;
    }
    return engine().fromTo(list, from, { overwrite: 'auto', ...to });
  };

  const UiMotion = {
    initialReveal: () => {
      const contentTargets = document.querySelectorAll('.workflow-card, .main > .card');
      if (reduce() || !engine()) {
        finish('.header-content');
        return finish(contentTargets);
      }
      return engine().timeline({ defaults: { ease: 'power2.out' } })
        .fromTo('.header-content', { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .45 })
        .fromTo(contentTargets, { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .38, stagger: .055 }, '-=.2');
    },
    workflowTransition: (step) => animate(step, { y: 4, autoAlpha: .75 }, { y: 0, autoAlpha: 1, duration: .2, ease: 'power1.out' }),
    calendarReveal: () => animate('#calendar tbody td:not(.empty)', { y: 6, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .2, stagger: .012, ease: 'power1.out' }),
    importHighlight: (targets) => animate(targets, { y: 4, autoAlpha: .7 }, { y: 0, autoAlpha: 1, duration: .24, stagger: .018, ease: 'power1.out' }),
    resultReveal: (value) => {
      const area = document.getElementById('resultArea');
      if (!area) return null;
      const amount = document.getElementById('finalNetPay');
      resultTimeline?.kill();
      resultTimeline = null;
      if (reduce() || !engine()) {
        finish([area]);
        return null;
      }
      const finalText = amount ? amount.textContent : '';
      const finalNumber = Number(value);
      const state = { value: 0 };
      resultTimeline = engine().timeline({ defaults: { ease: 'power3.out' } })
        .fromTo(area, { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .45 })
        .fromTo('.payslip-summary-card, .payslip-section', { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .3, stagger: .045 }, '-=.2')
        .to(state, {
          value: Number.isFinite(finalNumber) ? finalNumber : 0,
          duration: .65,
          onUpdate: () => { if (amount) amount.textContent = `NT$ ${Math.round(state.value).toLocaleString()}`; },
          onComplete: () => { if (amount) amount.textContent = finalText; }
        }, '<');
      return resultTimeline;
    },
    openRecordPanel: (panel) => animate([panel], { xPercent: 100, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, duration: .38, ease: 'power3.out' }),
    closeRecordPanel: (panel, onComplete) => {
      if (!panel) return null;
      if (reduce() || !engine()) {
        finish([panel], false);
        onComplete?.();
        return null;
      }
      return engine().to(panel, { xPercent: 100, autoAlpha: 0, duration: .28, ease: 'power2.in', onComplete });
    },
    openModal: (overlay) => {
      if (!overlay) return null;
      if (reduce() || !engine()) return finish([overlay]);
      return engine().timeline()
        .fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1, duration: .2 })
        .fromTo(overlay.querySelector('.modal'), { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .3, ease: 'power3.out' }, '<');
    },
    closeModal: (overlay, onComplete) => {
      if (!overlay) return null;
      if (reduce() || !engine()) {
        finish([overlay], false);
        onComplete?.();
        return null;
      }
      return engine().to(overlay, { autoAlpha: 0, duration: .2, ease: 'power1.in', onComplete });
    }
  };

  window.UiMotion = UiMotion;
}());
