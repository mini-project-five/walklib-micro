#!/bin/bash

# Kill Port Conflicts Script for WalkLib Micro Services

echo "🚨 Killing Port Conflicts for WalkLib Micro Services"
echo "===================================================="

# Required ports for WalkLib services
REQUIRED_PORTS=(2181 9092 8082 8083 8084 8085 8086 8087 8088 8089 3000)

echo "🔍 Checking for processes using WalkLib required ports..."

KILLED_PROCESSES=()

for port in "${REQUIRED_PORTS[@]}"; do
    # Find process using the port
    process=$(lsof -ti:$port 2>/dev/null)
    
    if [ ! -z "$process" ]; then
        # Get process info
        process_info=$(ps -p $process -o pid,ppid,comm,args --no-headers 2>/dev/null)
        
        if [ ! -z "$process_info" ]; then
            echo "⚠️  Port $port is used by:"
            echo "   $process_info"
            
            # Ask for confirmation
            read -p "   Kill this process? (y/N): " confirm
            
            if [[ $confirm =~ ^[Yy]$ ]]; then
                if kill -9 $process 2>/dev/null; then
                    echo "   ✅ Process $process killed successfully"
                    KILLED_PROCESSES+=("$port:$process")
                else
                    echo "   ❌ Failed to kill process $process"
                fi
            else
                echo "   ⏭️  Skipped port $port"
            fi
        fi
    else
        echo "✅ Port $port is free"
    fi
    echo ""
done

# Summary
if [ ${#KILLED_PROCESSES[@]} -gt 0 ]; then
    echo "📋 Summary of killed processes:"
    for item in "${KILLED_PROCESSES[@]}"; do
        port=$(echo $item | cut -d':' -f1)
        pid=$(echo $item | cut -d':' -f2)
        echo "   Port $port: Process $pid killed"
    done
    echo ""
    echo "✅ Port conflicts resolved!"
    echo "🚀 You can now start the Docker services:"
    echo "   docker-compose -f ../build-docker-compose.yml up -d"
else
    echo "✅ No port conflicts found. All ports are available!"
fi

echo ""
echo "🔍 Current port status:"
echo "Port | Status"
echo "-----------"
for port in "${REQUIRED_PORTS[@]}"; do
    if netstat -tuln 2>/dev/null | grep -q ":$port "; then
        echo "$port  | 🔴 IN USE"
    else
        echo "$port  | 🟢 FREE"
    fi
done

echo ""
echo "✨ Port conflict resolution completed!"