// jQuery validation improvements
// - "Other" gender input now forbids numbers (pattern enforced).
// - Live validation (keyup/blur/change) treats an empty field as neutral (clears red/green).
// - On submit, empty fields are considered invalid (required).
// - Uses validateField($el, treatEmptyAsNeutral) where treatEmptyAsNeutral=true for live events.

$(function () {
    // Common regexes
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var passwordStrengthRegex = /^(?=.*[A-Za-z])(?=.*\d).+$/; // at least one letter and one digit

    function getAttrNumber($el, attrName, fallback) {
        var v = $el.data(attrName);
        return (v === undefined) ? fallback : Number(v);
    }

    // validateField returns:
    //   true  => valid
    //   false => invalid
    //   null  => neutral (empty during live validation)
    function validateField($el, treatEmptyAsNeutral) {
        if (treatEmptyAsNeutral === undefined) treatEmptyAsNeutral = true;

        var tag = $el.prop('tagName').toLowerCase();
        var type = ($el.attr('type') || '').toLowerCase();
        var valRaw = $el.val();
        var val = (valRaw === undefined || valRaw === null) ? '' : $.trim(String(valRaw));
        var $msg = $el.closest('.form-group').find('.error-msg');
        var customMsg = $el.data('msg') || 'This field is required.';
        var customInvalidMsg = $el.data('msg-invalid') || null;
        var rule = $el.data('validate') || type || tag; // e.g. name, email, age, password, select, text

        // If empty
        if (!val) {
            if (treatEmptyAsNeutral) {
                // Live validation: clear states and messages (neutral)
                $el.removeClass('error valid');
                $msg.text('');
                return null;
            } else {
                // Submit validation: mark as invalid
                $el.addClass('error').removeClass('valid');
                $msg.text(customMsg);
                return false;
            }
        }

        // Non-empty: run field-specific rules
        var isValid = true;
        var message = '';

        if (rule === 'email' || type === 'email') {
            if (!emailRegex.test(val)) {
                isValid = false;
                message = customInvalidMsg || 'Please enter a valid email address (e.g. name@example.com).';
            }
        } else if (rule === 'age' || $el.attr('name') === 'age') {
            var num = Number(val);
            var min = getAttrNumber($el, 'min', Number($el.attr('min')) || 18);
            var max = getAttrNumber($el, 'max', Number($el.attr('max')) || 100);
            // Must be integer
            if (!Number.isFinite(num) || Math.floor(num) !== num) {
                isValid = false;
                message = customInvalidMsg || 'Age must be a whole number.';
            } else if (num < min || num > max) {
                isValid = false;
                message = customInvalidMsg || ('Age must be between ' + min + ' and ' + max + '.');
            }
        } else if (rule === 'password' || type === 'password') {
            var minLen = getAttrNumber($el, 'minlength', Number($el.attr('minlength')) || 6);
            var maxLen = getAttrNumber($el, 'maxlength', Number($el.attr('maxlength')) || 12);
            if (val.length < minLen) {
                isValid = false;
                message = customInvalidMsg || ('Password must be at least ' + minLen + ' characters.');
            } else if (val.length > maxLen) {
                isValid = false;
                message = customInvalidMsg || ('Password must be at most ' + maxLen + ' characters.');
            } else if (!passwordStrengthRegex.test(val)) {
                isValid = false;
                message = customInvalidMsg || 'Password must include at least one letter and one number.';
            }
        } else if (rule === 'name' || rule === 'text') {
            var minLenN = getAttrNumber($el, 'minlength', Number($el.attr('minlength')) || 2);
            var maxLenN = getAttrNumber($el, 'maxlength', Number($el.attr('maxlength')) || 30);
            var patStr = $el.data('pattern') || $el.attr('pattern') || null;
            if (val.length < minLenN) {
                isValid = false;
                message = customInvalidMsg || ('Must be at least ' + minLenN + ' characters.');
            } else if (val.length > maxLenN) {
                isValid = false;
                message = customInvalidMsg || ('Must be at most ' + maxLenN + ' characters.');
            } else if (patStr) {
                try {
                    var pat = new RegExp(patStr);
                    if (!pat.test(val)) {
                        isValid = false;
                        message = customInvalidMsg || 'Invalid format.';
                    }
                } catch (err) {
                    // invalid pattern — ignore pattern match
                }
            }
        } else if (rule === 'select' || tag === 'select') {
            if (!val) {
                isValid = false;
                message = customMsg;
            }
        }

        // Apply classes & message
        if (!isValid) {
            $el.addClass('error').removeClass('valid');
            $msg.text(message);
            return false;
        } else {
            $el.addClass('valid').removeClass('error');
            $msg.text('');
            return true;
        }
    }

    // Attach handlers to all fields with the .validate class (live)
    $('.validate').on('keyup blur', function () {
        validateField($(this), true); // treat empty as neutral during live typing
    });

    // Also validate on change (important for select and number)
    $('.validate').on('change', function () {
        validateField($(this), true);
    });

    // Show/hide 'other gender' and ensure it's validated only when visible
    $('#genderSelect').on('change', function () {
        var val = $(this).val();
        if (val === 'others') {
            $('#otherGenderContainer').slideDown(150).removeClass('hidden');
            $('#otherGenderBox').addClass('validate');
        } else {
            $('#otherGenderContainer').slideUp(150).addClass('hidden');
            // clear its state and value when hidden
            $('#otherGenderBox').removeClass('validate').val('').removeClass('error valid');
            $('#otherGenderContainer .error-msg').text('');
        }
    });

    // On submit validate all .validate elements; focus first invalid; prevent submit if invalid
    $('#studentForm').on('submit', function (e) {
        var $all = $(this).find('.validate');
        var allValid = true;

        $all.each(function () {
            var ok = validateField($(this), false); // on submit, empty = invalid
            if (ok === false) {
                allValid = false;
            }
        });

        if (!allValid) {
            e.preventDefault();
            var $firstInvalid = $(this).find('.validate.error').first();
            if ($firstInvalid.length) {
                $firstInvalid.focus();
            }
        } else {
            // Valid: allow default submit or handle via AJAX here
        }
    });

    // Reset clears classes, messages and hides other gender
    $('#resetBtn').on('click', function () {
        setTimeout(function () {
            var $form = $('#studentForm');
            $form.find('.form-control').removeClass('error valid');
            $form.find('.error-msg').text('');
            $('#otherGenderContainer').addClass('hidden').hide();
        }, 0);
    });

    // Initial check for other gender visibility (if prefilled)
    if ($('#genderSelect').val() === 'others') {
        $('#otherGenderContainer').show().removeClass('hidden');
        $('#otherGenderBox').addClass('validate');
    }
});
