import * as React from 'react';
import {
  Button,
  MenuToggle,
  SearchInput,
  Select,
  SelectList,
  SelectOption,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';

export enum ProjectFilterOption {
  Name = 'Name',
  User = 'User',
}

type ProjectsToolbarProps = {
  filterOption: ProjectFilterOption;
  onFilterOptionChange: (option: ProjectFilterOption) => void;
  filterValue: string;
  onFilterValueChange: (value: string) => void;
  onCreateProject: () => void;
};

const ProjectsToolbar: React.FC<ProjectsToolbarProps> = ({
  filterOption,
  onFilterOptionChange,
  filterValue,
  onFilterValueChange,
  onCreateProject,
}) => {
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);

  return (
    <>
      <ToolbarGroup variant="filter-group">
        <ToolbarItem>
          <Select
            isOpen={isFilterOpen}
            selected={filterOption}
            onSelect={(_e, value) => {
              if (value === ProjectFilterOption.Name || value === ProjectFilterOption.User) {
                onFilterOptionChange(value);
              }
              setIsFilterOpen(false);
            }}
            onOpenChange={setIsFilterOpen}
            toggle={(toggleRef) => (
              <MenuToggle
                ref={toggleRef}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                isExpanded={isFilterOpen}
                data-testid="project-filter-dropdown"
              >
                {filterOption}
              </MenuToggle>
            )}
          >
            <SelectList>
              <SelectOption value={ProjectFilterOption.Name}>Name</SelectOption>
              <SelectOption value={ProjectFilterOption.User}>User</SelectOption>
            </SelectList>
          </Select>
        </ToolbarItem>
        <ToolbarItem>
          <SearchInput
            placeholder={`Filter by ${filterOption.toLowerCase()}`}
            value={filterValue}
            onChange={(_e, value) => onFilterValueChange(value)}
            onClear={() => onFilterValueChange('')}
            aria-label={`Filter by ${filterOption.toLowerCase()}`}
            data-testid="project-filter-input"
          />
        </ToolbarItem>
      </ToolbarGroup>
      <ToolbarGroup>
        <ToolbarItem>
          <Button variant="primary" onClick={onCreateProject} data-testid="create-project-button">
            Create project
          </Button>
        </ToolbarItem>
      </ToolbarGroup>
    </>
  );
};

export default ProjectsToolbar;
