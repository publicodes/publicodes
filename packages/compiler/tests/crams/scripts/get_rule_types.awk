#!/usr/bin/awk -f

# Print the rule name
/^[ \t]*'[^']+':[ \t]*\{/ {
    match($0, /'[^']+':/)
    print substr($0, RSTART, RLENGTH)
}

# Print the type of the rule
/^\s+type: "/ { print "  type: " $2 }

/^\s+unit: "/ { print "  unit: " $2 }

/=> \{value:/ {
    match($0, /\{value: [^,}]+/)
    print "  value: " substr($0, RSTART + 8, RLENGTH - 8)
}
