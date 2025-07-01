#!/bin/bash

echo "🚀 Setting up walklib-micro development environment..."

# Set JAVA_HOME to Java 21 runtime
export JAVA_HOME=/workspace/.vscode-remote/data/User/globalStorage/pleiades.java-extension-pack-jdk/java/21
echo "✅ Java environment set to: $JAVA_HOME"

# List of all services
services=("ai_system_management" "author_management" "book_management" "content_writing_management" "point_management" "subscription_management" "user_management" "gateway")

echo "🔧 Updating POM files for Java 21 compatibility..."

for service in "${services[@]}"; do
    if [ -f "../$service/pom.xml" ]; then
        echo "Updating $service..."
        
        # Update Lombok version to 1.18.32 (Java 21 compatible)
        sed -i 's/<version>1\.18\.[0-9]*<\/version>/<version>1.18.32<\/version>/' "../$service/pom.xml"
        
        # Ensure Maven compiler plugin is 3.11.0
        if ! grep -q "maven-compiler-plugin.*3.11.0" "../$service/pom.xml"; then
            sed -i 's/<version>3\.[0-9]*\.[0-9]*<\/version>/<version>3.11.0<\/version>/' "../$service/pom.xml"
        fi
        
        echo "✅ Updated $service"
    else
        echo "⚠️  Warning: ../$service/pom.xml not found"
    fi
done

# Fix timestamp conflicts in event classes
echo "🔧 Fixing timestamp conflicts in event classes..."

# Fix ai_system_management PublicationRequested
if [ -f "../ai_system_management/src/main/java/miniproject/domain/PublicationRequested.java" ]; then
    if grep -q "private Date timestamp;" "../ai_system_management/src/main/java/miniproject/domain/PublicationRequested.java"; then
        sed -i '/private Date timestamp;/d' "../ai_system_management/src/main/java/miniproject/domain/PublicationRequested.java"
        echo "✅ Fixed ai_system_management PublicationRequested timestamp conflict"
    fi
fi

# Fix content_writing_management PublicationRequested
if [ -f "../content_writing_management/src/main/java/miniproject/domain/PublicationRequested.java" ]; then
    if grep -q "private Date timestamp;" "../content_writing_management/src/main/java/miniproject/domain/PublicationRequested.java"; then
        sed -i '/private Date timestamp;/d' "../content_writing_management/src/main/java/miniproject/domain/PublicationRequested.java"
        echo "✅ Fixed content_writing_management PublicationRequested timestamp conflict"
    fi
fi

echo "🏗️  Building all services..."

# Build all services
build_success=0
build_total=0

for service in "${services[@]}"; do
    if [ -f "../$service/pom.xml" ]; then
        echo "Building $service..."
        build_total=$((build_total + 1))
        
        if cd "../$service" && mvn clean package -DskipTests -q; then
            echo "✅ $service build SUCCESS"
            build_success=$((build_success + 1))
        else
            echo "❌ $service build FAILED"
        fi
        cd ../scripts
    fi
done

echo ""
echo "🎉 Environment setup complete!"
echo "📊 Build Summary: $build_success/$build_total services built successfully"

if [ $build_success -eq $build_total ]; then
    echo "✅ All services are ready for development!"
else
    echo "⚠️  Some services failed to build. Check the output above for details."
fi

echo ""
echo "💡 To run individual services:"
echo "   cd <service_name> && mvn spring-boot:run"
echo ""
echo "💡 To rebuild all services:"
echo "   export JAVA_HOME=/workspace/.vscode-remote/data/User/globalStorage/pleiades.java-extension-pack-jdk/java/21"
echo "   for service in ai_system_management author_management book_management content_writing_management point_management subscription_management user_management gateway; do"
echo "     cd \$service && mvn clean package -DskipTests && cd .."
echo "   done"