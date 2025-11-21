/* jQuery-based validation: works across multiple inputs and is easy to expand */
$(function(){
  // Cache the inputs to validate
  const $inputs = $('.validate');

  // Generic validator - currently only checks non-empty, but easy to extend
  function validate($el){
    const raw = ($el.val() || '');
    const value = raw.trim();
    const fieldName = $el.data('field') || 'This field';
    const $msg = $el.siblings('.error-text');

    // Condition: empty -> error, non-empty -> valid
    if(!value){
      $el.removeClass('valid').addClass('error');
      $msg.text(fieldName + ' is required.');
      return false;
    }

    // If you want field-type-specific checks, expand here (example for email):
    if($el.attr('type') === 'email'){
      // simple email regex (lightweight)
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if(!emailRe.test(value)){
        $el.removeClass('valid').addClass('error');
        $msg.text('Please enter a valid email address.');
        return false;
      }
    }

    // passed validation
    $el.removeClass('error').addClass('valid');
    $msg.text('');
    return true;
  }

  // Attach handlers: keyup and blur as requested
  $inputs.on('keyup blur', function(){
    validate($(this));
  });

  // On submit, validate all inputs and prevent submission if any fail
  $('#student-form').on('submit', function(e){
    let allGood = true;
    $inputs.each(function(){
      const ok = validate($(this));
      if(!ok) allGood = false;
    });

    if(!allGood){
      // focus the first invalid field for convenience
      $('.error').first().focus();
      e.preventDefault();
    }
  });

  // Expose a simple API for adding new validation rules later
  window.formValidators = {
    validateAll: function(){
      let ok = true;
      $inputs.each(function(){ if(!validate($(this))) ok = false; });
      return ok;
    }
  };
});
