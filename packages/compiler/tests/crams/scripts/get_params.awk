# !/usr/bin/awk -f

# Active when we are inside the rules object
/const rules = \{/ { in_rules = 1; next }
/export const parameters = \{/ { in_rules = 0 }

# Print the rule name
in_rules && /^[ \t]*'[^']+':[ \t]*\{/ {
    match($0, /'[^']+':/)
    print "  " substr($0, RSTART, RLENGTH)
}

# Print the params section
in_rules && /params:/ { p = 1; print; if (/\]/) p = 0; next }
in_rules && p { print; if (/\]/) p = 0 }
